import FormData from 'form-data'
import {
  FetchOptions,
  OnServerEventCallback,
  PaginationArg,
  ServerEvent,
  ServerEventType,
  texts,
} from '@textshq/platform-sdk'
import { WebSocketClientOptions } from '@textshq/platform-sdk/dist/PersistentWS'
import {
  ACCESS_TOKEN_MIN_TTL,
  OAUTH_TOKEN_REFRESH_URL,
  API_URLS,
  REQUEST_HEADERS,
  CHANNEL_HEADERS,
  CHANNEL_EVENTS,
} from '../constants'
import {
  AnyJSON,
  TumblrUserInfo,
  TumblrFetchResponse,
  TumblrHttpResponseBody,
  AuthCredentialsWithDuration,
  AuthCredentialsWithExpiration,
  Conversation,
  ApiLinks,
  OutgoingMessage,
  MessagesResponse,
  UnreadCountsResponse,
  Message,
  Blog,
  OutgoingMessageToCreateConversation,
} from '../types'
import ConversationsChannel from './conversation-channel'
import { camelCaseKeys } from './word-case'
import { mapBlogNameToNetworkDomain, mapMessage } from '../mappers'
import { addThreadMessageIDs, getThreadIDs, getThreadLastReadMessageID, getThreadUnreadCount, updateThreadLastReadTs } from './state'

/**
 * Strips out the api version path, because we use /v2/ by default.
 */
const stripApiVersion = (path: string): string => path.replace(/^\/v2/, '')

export class TumblrClient {
  currentUser: TumblrUserInfo = null

  private authCreds: AuthCredentialsWithExpiration

  private httpClient = texts.createHttpClient()

  private conversationsChannel: {
    token?: string
    channel?: ConversationsChannel
  } = {}

  private unreadCountsPollingInterval = 10_000

  private unreadCountsPollingTimoutId: ReturnType<typeof setTimeout>

  private authTokenRefresh: Promise<void> = null

  pendingEventsQueue: ServerEvent[] = []

  eventCallback: OnServerEventCallback = (events: ServerEvent[]) => {
    this.pendingEventsQueue.push(...events)
  }

  getAuthCreds = () => this.authCreds

  private static areCredsWithDuration = (creds: AuthCredentialsWithDuration | AuthCredentialsWithExpiration): creds is AuthCredentialsWithDuration =>
    !!(creds as AuthCredentialsWithDuration).expires_in

  setAuthCreds = (creds: AuthCredentialsWithDuration | AuthCredentialsWithExpiration) => {
    if (TumblrClient.areCredsWithDuration(creds)) {
      const { expires_in, ...authCreds } = creds
      this.authCreds = {
        ...authCreds,
        expires_at: Date.now() + expires_in * 1000 - ACCESS_TOKEN_MIN_TTL,
      }
    } else {
      this.authCreds = creds
    }
  }

  /**
   * Makes sure the access token is up to date. In case if access token
   * is expired it updates it with a new one.
   */
  private ensureUpdatedCreds = async () => {
    if (!this.authCreds) {
      throw new Error('Tumblr not logged in')
    }

    if (this.authCreds.expires_at > Date.now()) {
      return
    }

    // If there is already another auth token refresh is happening
    // then return that
    if (this.authTokenRefresh instanceof Promise) {
      return this.authTokenRefresh
    }

    let resolve: () => void = () => {}
    let reject: () => void = () => {}
    this.authTokenRefresh = new Promise((res, rej) => {
      resolve = res
      reject = rej
    })

    try {
      const response = await this.httpClient.requestAsString(OAUTH_TOKEN_REFRESH_URL, {
        method: 'POST',
        headers: REQUEST_HEADERS,
        body: JSON.stringify({
          refresh_token: this.authCreds.refresh_token,
        }),
      })
      this.setAuthCreds(JSON.parse(response.body) as AuthCredentialsWithDuration)
      this.eventCallback([{
        type: ServerEventType.SESSION_UPDATED,
      }])
      resolve()
    } catch (err) {
      reject()
      throw new Error(`Wasn't able to renew the access_token. Error: ${err}`)
    } finally {
      this.authTokenRefresh = null
    }
  }

  /**
   * Tumblr API tailored fetch.
   */
  private fetch = async <T = AnyJSON>(
    url: string,
    opts: FetchOptions = {},
  ): Promise<TumblrFetchResponse<TumblrHttpResponseBody<T>>> => {
    await this.ensureUpdatedCreds()
    const response = await this.httpClient.requestAsString(url, {
      ...opts,
      headers: {
        Authorization: `Bearer ${this.authCreds.access_token}`,
        ...REQUEST_HEADERS,
        ...(opts.headers || {}),
      },
    })
    return {
      ...response,
      json: JSON.parse(response.body),
    }
  }

  /**
   * Fetches the current user info.
   */
  getCurrentUser = async (): Promise<TumblrUserInfo> => {
    if (this.currentUser) {
      return this.currentUser
    }

    const response = await this.fetch<{ user: Omit<TumblrUserInfo, 'activeBlog'> }>(API_URLS.USER_INFO)
    const { user } = response.json.response
    const primaryBlog = user.blogs.find(({ primary }) => primary)

    // This should never happen. But if it happens we want to know
    // right away.
    if (!primaryBlog) {
      throw Error("Unable to detect user's primary blog")
    }

    this.currentUser = {
      ...user,
      activeBlog: primaryBlog,
    }

    return this.currentUser
  }

  /**
   * Fetches the conversations.
   */
  getConversations = async (pagination?: PaginationArg) => {
    let url = API_URLS.CONVERSATIONS
    if (pagination?.cursor) {
      url = `${API_URLS.BASE}${stripApiVersion(pagination.cursor)}`
    }

    const response = await this.fetch<{ conversations: Conversation[], links?: ApiLinks }>(url)
    const { conversations, links } = response.json.response
    const currentUser = await this.getCurrentUser()

    for (const conversation of conversations) {
      updateThreadLastReadTs(conversation.id, conversation)
      addThreadMessageIDs(conversation.id, conversation.messages.data.map(m => ({
        id: m.ts,
        isSender: m.participant === currentUser.activeBlog.uuid,
      })))
    }

    return {
      ...response,
      json: { conversations, links },
    }
  }

  /**
   * Creates the conversation by sending a message.
   */
  createConversation = async (body: OutgoingMessageToCreateConversation) => {
    const options: FetchOptions = {
      method: 'POST',
    }
    if (body.type === 'IMAGE') {
      const form = new FormData()
      form.append('type', 'IMAGE')
      form.append('participant', body.participant)
      form.append('participants', body.participants)
      form.append('data', body.data, { filename: body.filename })
      options.body = form
      options.headers = form.getHeaders()
    } else {
      options.body = JSON.stringify(body)
    }

    const response = await this.fetch<MessagesResponse>(API_URLS.MESSAGES, options)
    const currentUser = await this.getCurrentUser()
    const { token, id } = response.json.response
    this.subscribeToMessages(token, id, currentUser.activeBlog.name)

    return {
      ...response,
      json: response.json.response,
    }
  }

  deleteConversation = async (conversationId: string) => {
    const user = await this.getCurrentUser()
    const response = await this.fetch<string>(`${API_URLS.MESSAGES}?conversation_id=${conversationId}&participant=${mapBlogNameToNetworkDomain(user.activeBlog.name)}`, {
      method: 'DELETE',
    })

    this.eventCallback([{
      type: ServerEventType.STATE_SYNC,
      objectIDs: {
        threadID: conversationId,
      },
      objectName: 'thread',
      mutationType: 'delete',
      entries: [conversationId],
    }])

    return {
      ...response,
      json: { message: response.json.response },
    }
  }

  markConversationAsRead = async (conversationId: string) => {
    const user = await this.getCurrentUser()
    const response = await this.fetch<any[]>(API_URLS.MARK_AS_READ, {
      method: 'POST',
      body: JSON.stringify({
        conversation_id: conversationId,
        participant: mapBlogNameToNetworkDomain(user.activeBlog.name),
      }),
    })

    updateThreadLastReadTs(conversationId)

    return response.json.response
  }

  /**
   * Fetches the messages for conversation.
   */
  getMessages = async ({
    conversationId,
    blogName,
    pagination,
    limit,
    skipStateUpdate = false,
  }: {
    conversationId: string
    blogName: string
    pagination?: PaginationArg
    limit?: number
    skipStateUpdate?: boolean
  }) => {
    let url = `${API_URLS.MESSAGES}?participant=${mapBlogNameToNetworkDomain(blogName)}&conversation_id=${conversationId}&preserve_last_read_ts=1`
    if (pagination) {
      url = `${url}&${pagination.direction}=${pagination.cursor}`
    }
    if (limit) {
      url = `${url}&limit=${limit}`
    }
    const response = await this.fetch<MessagesResponse>(url)
    const conversation = response.json.response
    const currentUser = await this.getCurrentUser()

    this.subscribeToMessages(conversation.token, conversationId, blogName)

    if (!skipStateUpdate) {
      addThreadMessageIDs(
        conversation.id,
        conversation.messages.data.map(m => ({
          id: m.ts,
          isSender: m.participant === currentUser.activeBlog.uuid,
        })),
      )
    }

    return {
      ...response,
      json: conversation,
    }
  }

  sendMessage = async (body: OutgoingMessage) => {
    const options: FetchOptions = {
      method: 'POST',
    }
    if (body.type === 'IMAGE') {
      const form = new FormData()
      form.append('type', 'IMAGE')
      form.append('participant', body.participant)
      form.append('conversation_id', body.conversation_id)
      form.append('data', body.data, { filename: body.filename })
      options.body = form
      options.headers = form.getHeaders()
    } else {
      options.body = JSON.stringify(body)
    }

    const response = await this.fetch<MessagesResponse>(API_URLS.MESSAGES, options)

    return {
      ...response,
      json: response.json.response,
    }
  }

  dispose = () => {
    this.disposeConversationsChannel()
    if (this.unreadCountsPollingTimoutId) {
      clearTimeout(this.unreadCountsPollingTimoutId)
    }
  }

  disposeConversationsChannel = () => {
    this.conversationsChannel.channel?.dispose()
    this.conversationsChannel = {}
  }

  getConnectionInfo = async (): Promise<{ endpoint: string, options?: WebSocketClientOptions }> => ({
    endpoint: `wss://telegraph.srvcs.tumblr.com/socket?token=${this.conversationsChannel.token}`,
    options: { headers: CHANNEL_HEADERS },
  })

  subscribeToMessages = async (token: string, conversationId: string, blogName: string) => {
    if (!this.conversationsChannel.token) {
      this.conversationsChannel.token = token
      this.conversationsChannel.channel = new ConversationsChannel(
        this.getConnectionInfo,
        this.onChannelMessage,
      )
      await this.conversationsChannel.channel.connect()
    }

    this.conversationsChannel.channel?.subscribeToMessages(conversationId, blogName)
  }

  onChannelMessage = async (buffer: Buffer) => {
    try {
      const messageEvent: {
        event: string
        data: string
        channel: string
      } = JSON.parse(`${buffer}`)
      if (messageEvent.event !== CHANNEL_EVENTS.NEW_MESSAGE) {
        return
      }
      const { conversationId } = ConversationsChannel.parseConversationChannelString(messageEvent.channel)
      const message = JSON.parse(messageEvent.data) as Message
      const currentUser = await this.getCurrentUser()

      this.eventCallback([{
        type: ServerEventType.STATE_SYNC,
        objectIDs: {
          threadID: conversationId,
        },
        objectName: 'message',
        mutationType: 'upsert',
        entries: [mapMessage(camelCaseKeys(message), currentUser.activeBlog)],
      }])
    } catch (err) {
      texts.error('Was not able to process the incoming message', err)
    }
  }

  getUnreadCounts = async () => {
    const response = await this.fetch(API_URLS.UNREAD_COUNTS)
    return response.json as unknown as UnreadCountsResponse
  }

  setUnreadCountsPollingInterval = (interval: number) => {
    // Prevent unwanted polling intervals
    if (Number.isNaN(interval) || interval < 1000) {
      return
    }
    this.unreadCountsPollingInterval = interval
  }

  pollUnreadCounts = async () => {
    if (this.unreadCountsPollingTimoutId) {
      clearTimeout(this.unreadCountsPollingTimoutId)
    }

    try {
      await this.checkUnreadCounts()
    } catch {
      // silence is golden
    } finally {
      this.unreadCountsPollingTimoutId = setTimeout(() => {
        this.pollUnreadCounts()
      }, this.unreadCountsPollingInterval)
    }
  }

  private checkUnreadCounts = async () => {
    const currentUser = await this.getCurrentUser()
    const { unread_messages } = await this.getUnreadCounts()

    const unreadCounts = unread_messages[currentUser.activeBlog.mentionKey] || {}
    for (const conversationId of getThreadIDs()) {
      const unreadCount = unreadCounts[conversationId] || 0
      if (getThreadUnreadCount(conversationId) !== unreadCount) {
        const { json: conversation } = await this.getMessages({
          conversationId,
          limit: unreadCount,
          blogName: currentUser.activeBlog.name,
          skipStateUpdate: true,
        })
        this.syncUnreadMessages(conversation)
      }
    }
  }

  getParticipantSuggestions = async (q: string) => {
    const response = await this.fetch<{ blogs: Blog[] }>(`${API_URLS.PARTICIPANT_SUGGESTIONS}?q=${q}`)
    return {
      ...response,
      json: response.json.response,
    }
  }

  markAsSpam = async (conversationId: string) => {
    const user = await this.getCurrentUser()
    const response = await this.fetch<string>(API_URLS.FLAG, {
      method: 'POST',
      body: JSON.stringify({
        type: 'spam',
        context: 'inline',
        conversation_id: conversationId,
        participant: mapBlogNameToNetworkDomain(user.activeBlog.name) }),
    })

    return {
      ...response,
      json: { message: response.json.response },
    }
  }

  getUser = async (userID: string) => {
    const response = await this.fetch<{ blog: Blog }>(`${API_URLS.BASE}/blog/${userID}/info`)
    return {
      ...response,
      json: { user: response.json.response.blog },
    }
  }

  private syncUnreadMessages = async (conversation: Conversation) => {
    const currentUser = await this.getCurrentUser()
    const unreadCountBefore = getThreadUnreadCount(conversation.id)
    const lastReadMessageIDBefore = getThreadLastReadMessageID(conversation.id)
    updateThreadLastReadTs(conversation.id, conversation)
    const newMessages = addThreadMessageIDs(
      conversation.id,
      conversation.messages.data.map(m => ({
        id: m.ts,
        isSender: m.participant === currentUser.activeBlog.uuid,
      })),
    )
    const unreadCount = getThreadUnreadCount(conversation.id)
    const lastReadMessageID = getThreadLastReadMessageID(conversation.id)

    const events: ServerEvent[] = []
    if (unreadCountBefore !== unreadCount || lastReadMessageIDBefore !== lastReadMessageID) {
      events.push({
        type: ServerEventType.STATE_SYNC,
        mutationType: 'update',
        objectName: 'thread',
        objectIDs: {},
        entries: [{
          id: conversation.id,
          isUnread: !!unreadCount,
          lastReadMessageID,
        }],
      })
    }

    if (newMessages.length) {
      const newMessageIDs = newMessages.map(m => m.id)
      events.push({
        type: ServerEventType.STATE_SYNC,
        mutationType: 'upsert',
        objectName: 'message',
        objectIDs: {
          threadID: conversation.id,
        },
        entries: conversation.messages.data
          .filter(m => newMessageIDs.includes(m.ts))
          .map(message => mapMessage(message, currentUser.activeBlog)),
      })
    }

    if (events.length) {
      this.eventCallback(events)
    }
  }
}

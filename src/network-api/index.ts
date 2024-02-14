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
import { mapMessage } from '../mappers'

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
    } catch (err) {
      throw new Error(`Wasn't able to renew the access_token. Error: ${err}`)
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
    return {
      ...response,
      json: response.json.response,
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
    const response = await this.fetch<string>(`${API_URLS.MESSAGES}?conversation_id=${conversationId}&participant=${user.activeBlog.name}.tumblr.com`, {
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

  /**
   * Fetches the messages for conversation.
   */
  getMessages = async ({
    conversationId,
    blogName,
    pagination,
    limit,
  }: {
    conversationId: string
    blogName: string
    pagination?: PaginationArg
    limit?: number
  }) => {
    let url = `${API_URLS.MESSAGES}?participant=${blogName}.tumblr.com&conversation_id=${conversationId}`
    if (pagination) {
      url = `${url}&${pagination.direction}=${pagination.cursor}`
    }
    if (limit) {
      url = `${url}&limit=${limit}`
    }
    const response = await this.fetch<MessagesResponse>(url)

    this.subscribeToMessages(response.json.response.token, conversationId, blogName)

    return {
      ...response,
      json: response.json.response,
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
    return camelCaseKeys(response.json) as unknown as UnreadCountsResponse
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
    } finally {
      this.unreadCountsPollingTimoutId = setTimeout(() => {
        this.pollUnreadCounts()
      }, this.unreadCountsPollingInterval)
    }
  }

  private getUnreadMessages = async (conversationId, unreadCount) => {
    const currentUser = await this.getCurrentUser()
    const response = this.getMessages({
      conversationId,
      limit: unreadCount,
      blogName: currentUser.activeBlog.name,
    })

    this.eventCallback([{
      type: ServerEventType.STATE_SYNC,
      objectIDs: {
        threadID: conversationId,
      },
      objectName: 'message',
      mutationType: 'upsert',
      entries: (await response).json.messages.data.map(message => mapMessage(message, currentUser.activeBlog)),
    }])
  }

  private checkUnreadCounts = async () => {
    if (!this.authCreds) {
      return
    }

    const { unreadMessages } = await this.getUnreadCounts()

    const conversations = Object.values(unreadMessages)
    for (const conversation of conversations) {
      const conversationId = Object.keys(conversation)[0]
      const unreadCount = conversation[conversationId]
      if (conversationId && unreadCount > 0) {
        this.getUnreadMessages(conversationId, unreadCount)
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
        participant: `${user.activeBlog.name}.tumblr.com` }),
    })

    return {
      ...response,
      json: { message: response.json.response },
    }
  }
}

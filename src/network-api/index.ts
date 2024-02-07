import FormData from 'form-data'
import {
  FetchOptions,
  OnServerEventCallback,
  PaginationArg,
  ServerEvent,
  ServerEventType,
  texts,
} from '@textshq/platform-sdk'
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
} from '../types'
import ConversationsChannel from './conversation-channel'
import { camelCaseKeys } from './word-case'

/**
 * Strips out the api version path, because we use /v2/ by default.
 */
const stripApiVersion = (path: string): string => path.replace(/^\/v2/, '')

export class TumblrClient {
  private authCreds: AuthCredentialsWithExpiration

  private httpClient = texts.createHttpClient()

  private conversationsChannel: {
    connection: 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'
    channel?: ConversationsChannel
  } = { connection: 'DISCONNECTED' }

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
  ensureUpdatedCreds = async () => {
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
  getCurrentUser = async () => {
    const response = await this.fetch<{ user: Omit<TumblrUserInfo, 'activeBlog'> }>(API_URLS.USER_INFO)
    return {
      ...response,
      json: response.json.response,
    }
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
   * Fetches the messages for conversation.
   */
  getMessages = async ({
    conversationId,
    blogName,
    pagination,
  }: {
    conversationId: string
    blogName: string
    pagination?: PaginationArg
  }) => {
    let url = `${API_URLS.MESSAGES}?participant=${blogName}.tumblr.com&conversation_id=${conversationId}`
    if (pagination) {
      url = `${url}&${pagination.direction}=${pagination.cursor}`
    }
    const response = await this.fetch<MessagesResponse>(url)

    this.openChannel(response.json.response.token)
    this.conversationsChannel.channel?.listenToConversation(conversationId, blogName)

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
      form.append('conversation_id', body.conversationId)
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
  }

  disposeConversationsChannel = () => {
    this.conversationsChannel.channel?.terminate()
    this.conversationsChannel = { connection: 'DISCONNECTED' }
  }

  openChannel = (token: string) => {
    if (this.conversationsChannel.connection !== 'DISCONNECTED') {
      return
    }
    this.conversationsChannel.connection = 'CONNECTING'
    try {
      const channel = new ConversationsChannel(
        `wss://telegraph.srvcs.tumblr.com/socket?token=${token}`,
        { headers: CHANNEL_HEADERS },
      )
      this.conversationsChannel = { connection: 'CONNECTED', channel }
      this.attachChannelListeners()
    } catch (err) {
      this.conversationsChannel.connection = 'DISCONNECTED'
      texts.log('Failed to establish websocket connection to conversations channel')
    }
  }

  attachChannelListeners = () => {
    this.conversationsChannel.channel.on('close', this.onChannelClose)
    this.conversationsChannel.channel.on('error', this.onChannelError)
    this.conversationsChannel.channel.on('message', this.onChannelMessage)
  }

  onChannelClose = () => {
    this.disposeConversationsChannel()
  }

  onChannelError = () => {
    this.disposeConversationsChannel()
  }

  onChannelMessage = (buffer: Buffer) => {
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
      const message = JSON.parse(messageEvent.data)
      this.eventCallback([{
        type: ServerEventType.STATE_SYNC,
        objectIDs: {
          threadID: conversationId,
        },
        objectName: 'message',
        mutationType: 'upsert',
        entries: [camelCaseKeys(message)],
      }])
    } catch (err) {
      texts.error('Was not able to process the incoming message', err)
    }
  }
}

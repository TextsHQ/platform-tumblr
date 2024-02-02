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
  ConversationStatus,
  Blog,
  MessagesObject,
  ConversationChannelConnected,
  ConversationChannelConnecting,
} from '../types'
import ConversationChannel from './ConversationChannel'

/**
 * Strips out the api version path, because we use /v2/ by default.
 */
const stripApiVersion = (path: string): string => path.replace(/^\/v2/, '')

export class TumblrClient {
  private authCreds: AuthCredentialsWithExpiration

  private httpClient = texts.createHttpClient()

  private channels: Record<string, ConversationChannelConnecting | ConversationChannelConnected> = {}

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
    const response = await this.fetch<{
      objectType: string
      id: string
      status: ConversationStatus
      lastModifiedTs: number
      lastReadTs: number
      canSend: boolean
      unreadMesssagesCount: number
      isPossibleSpam: boolean
      isBlurredImages: boolean
      participants: Blog[]
      messages: MessagesObject
      token: string
    }>(url)

    // Initiate the websocket connection for the current conversation
    this.openChannel(conversationId, blogName, response.json.response.token)

    return {
      ...response,
      json: response.json.response,
    }
  }

  disposeChannel = (...conversationIds: string[]) => {
    for (const conversationId of conversationIds) {
      const conversation = this.channels[conversationId]
      if (conversation?.connected) {
        conversation.channel.terminate()
        delete this.channels[conversationId]
      }
    }
  }

  dispose = () => {
    this.disposeChannel(...Object.keys(this.channels))
  }

  openChannel = (conversationId: string, blogName: string, token: string) => {
    if (this.channels[conversationId]) {
      return
    }
    this.channels[conversationId] = { connected: false }
    try {
      const channel = new ConversationChannel(
        `wss://telegraph.srvcs.tumblr.com/socket?token=${token}`,
        conversationId,
        blogName,
        { headers: CHANNEL_HEADERS },
      )
      this.channels[conversationId] = { connected: true, channel }
      this.attachChannelListeners(conversationId, channel)
    } catch (err) {
      delete this.channels[conversationId]
      texts.log(`Failed to establish websocket connection to channel: ${conversationId}`)
    }
  }

  attachChannelListeners = (conversationId: string, channel: ConversationChannel) => {
    channel.on('open', this.onChannelOpen(conversationId))
    channel.on('close', this.onChannelClose(conversationId))
    channel.on('error', this.onChannelError(conversationId))
    channel.on('message', this.onChannelMessage(conversationId))
  }

  // eslint-disable-next-line class-methods-use-this
  onChannelOpen = (conversationId: string) => (event: Event) => {
    console.log(`tumblr.channel(${conversationId}).open.event`, event)
  }

  onChannelClose = (conversationId: string) => (event: CloseEvent) => {
    this.disposeChannel(conversationId)
    console.log(`tumblr.channel(${conversationId}).close.event`, event)
  }

  onChannelError = (conversationId: string) => (event: Event) => {
    this.disposeChannel(conversationId)
    console.log(`tumblr.channel(${conversationId}).error.event`, event)
  }

  // eslint-disable-next-line class-methods-use-this
  onChannelMessage = (conversationId: string) => (event: MessageEvent) => {
    console.log(`tumblr.channel(${conversationId}).message.event`, event)
  }
}

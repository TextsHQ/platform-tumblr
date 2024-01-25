import {
  FetchOptions,
  PaginationArg,
  texts,
} from '@textshq/platform-sdk'
import {
  ACCESS_TOKEN_MIN_TTL,
  OAUTH_TOKEN_REFRESH_URL,
  API_URLS,
  REQUEST_HEADERS,
} from './constants'
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
} from './types'

/**
 * Strips out the api version path, because we use /v2/ by default.
 */
const stripApiVersion = (path: string): string => path.replace(/^\/v2/, '')

export class TumblrClient {
  private authCreds: AuthCredentialsWithExpiration

  private httpClient = texts.createHttpClient()

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
    const response = await this.fetch<{ user: TumblrUserInfo }>(API_URLS.USER_INFO)
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
    before,
  }: {
    conversationId: string | string
    blogName: string
    before?: number | string
  }) => {
    let url = `${API_URLS.MESSAGES}?participant=${blogName}.tumblr.com&conversation_id=${conversationId}`
    if (before) {
      url = `${url}&before=${before}`
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
    return {
      ...response,
      json: response.json.response,
    }
  }
}

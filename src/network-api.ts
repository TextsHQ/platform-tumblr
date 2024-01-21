import {
  FetchOptions,
  PaginationArg,
  texts,
} from '@textshq/platform-sdk'
import { CookieJar } from 'tough-cookie'
import {
  API_URLS,
  AUTH_COOKIE,
  LOGGED_IN_COOKIE,
  REQUEST_HEADERS,
} from './constants'
import {
  AnyJSON,
  TumblrUserInfo,
  TumblrFetchResponse,
  TumblrHttpResponseBody,
  Conversation,
  ApiLinks,
} from './types'

/**
 * Strips out the api version path, because we use /v2/ by default.
 */
const stripApiVersion = (path: string): string => path.replace(/^\/v2/, '')

export class TumblrClient {
  cookieJar: CookieJar

  private httpClient = texts.createHttpClient()

  /**
   * Remember the auth cookies
   */
  setLoginState = async (cookieJarJSON: CookieJar.Serialized) => {
    this.cookieJar = await CookieJar.deserialize(cookieJarJSON)
  }

  /**
   * Checks if the user has properly logged in.
   */
  static isLoggedIn = (cookieJar: CookieJar.Serialized) => {
    const sidCookie = cookieJar.cookies.find(({ key }) => key === AUTH_COOKIE)
    if (!sidCookie?.value) {
      return false
    }

    const loggedInCookie = cookieJar.cookies.find(
      ({ key }) => key === LOGGED_IN_COOKIE,
    )
    const loggedInValue = parseInt(loggedInCookie.value || '0', 10)
    return !Number.isNaN(loggedInValue) && loggedInValue > 0
  }

  /**
   * Tumblr API tailored fetch.
   */
  private fetch = async <T = AnyJSON>(
    url: string,
    opts: FetchOptions = {},
  ): Promise<TumblrFetchResponse<TumblrHttpResponseBody<T>>> => {
    const response = await this.httpClient.requestAsString(url, {
      ...opts,
      headers: {
        ...REQUEST_HEADERS,
        ...(opts.headers || {}),
      },
      cookieJar: this.cookieJar,
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
}

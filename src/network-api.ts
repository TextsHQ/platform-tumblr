import {
  FetchOptions,
  texts,
} from '@textshq/platform-sdk'
import { CookieJar } from 'tough-cookie'
import {
  AUTH_COOKIE,
  LOGGED_IN_COOKIE,
  REQUEST_HEADERS,
  USER_INFO_URL,
} from './constants'
import {
  AnyJSON,
  TumblrUserInfo,
  TumblrFetchResponse,
  TumblrHttpResponseBody,
} from './types'

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
  ): Promise<TumblrFetchResponse<TumblrHttpResponseBody<T> | AnyJSON>> => {
    try {
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
    } catch (error) {
      texts.error('Tumblr Fetch Error', error)
      return {
        statusCode: 400,
        body: `${error}`,
        headers: {},
        json: {},
        error,
      }
    }
  }

  /**
   * Tells if the api response is a success or fail/error.
   */
  static isSuccessResponse = <SuccessType = AnyJSON, ErrorType = AnyJSON>(
    response: TumblrFetchResponse<SuccessType> | TumblrFetchResponse<ErrorType>,
  ): response is TumblrFetchResponse<SuccessType> =>
    response.statusCode >= 200 && response.statusCode < 300

  /**
   * Fetches the current user info.
   */
  getCurrentUser = async () => {
    const response = await this.fetch(USER_INFO_URL)

    if (TumblrClient.isSuccessResponse<TumblrHttpResponseBody<{ user: TumblrUserInfo }>>(response)) {
      return {
        ...response,
        json: response.json.response.user,
      }
    }

    return Promise.reject(response)
  }
}

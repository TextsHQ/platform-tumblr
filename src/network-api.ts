import {
  FetchOptions,
  texts,
} from '@textshq/platform-sdk'
import { CookieJar } from 'tough-cookie'
import {
  API_URL,
  REQUEST_HEADERS,
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
  authenticate = async (oauthCode: string) => {
    console.log('tumblr.network.authenticate.oauthCode', oauthCode)
  }

  /**
   * Checks if the user has properly logged in.
   */
  static isLoggedIn = () => false

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
  getCurrentUser = async (): Promise<
  TumblrFetchResponse<TumblrUserInfo | AnyJSON>
  > => {
    const response = await this.fetch<{ user: TumblrUserInfo }>(`${API_URL}/user/info`)

    if (TumblrClient.isSuccessResponse<TumblrHttpResponseBody<{ user: TumblrUserInfo }>>(response)) {
      return {
        ...response,
        json: response.json.response.user,
      }
    }

    return response
  }
}

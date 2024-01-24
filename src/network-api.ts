import {
  FetchOptions,
  texts,
} from '@textshq/platform-sdk'
import {
  ACCESS_TOKEN_MIN_TTL,
  API_URL,
  OAUTH_TOKEN_REFRESH_URL,
  REQUEST_HEADERS,
} from './constants'
import {
  AnyJSON,
  TumblrUserInfo,
  TumblrFetchResponse,
  TumblrHttpResponseBody,
  AuthCredentialsWithDuration,
  AuthCredentialsWithExpiration,
} from './types'

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
  ): Promise<TumblrFetchResponse<TumblrHttpResponseBody<T> | AnyJSON>> => {
    this.ensureUpdatedCreds()
    try {
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

import { FetchResponse } from '@textshq/platform-sdk'

export interface AuthCredentials {
  /**
   * Token that is used to make api calls with `Authorization: Bearer ${access_token}` header.
   */
  access_token: string

  /**
   * The type of the token.
   */
  token_type: string

  /**
   * The permission scope of the token. E.g.: write offline_access
   */
  scope: string

  /**
   * The token that is used to refresh the access_token.
   */
  refresh_token: string
}

export interface AuthCredentialsWithDuration extends AuthCredentials {
  /**
   * The number of seconds after which the token expires.
   */
  expires_in: number
}

export interface AuthCredentialsWithExpiration extends AuthCredentials {
  /**
   * The epock timestamp when the token expires.
   */
  expires_at: number
}

export type AnyJSON = Record<string, any>

export type TumblrFetchResponse<T = AnyJSON> = FetchResponse<string> & {
  json: T
  error?: Error
}

export type TumblrHttpResponseBody<T = AnyJSON> = {
  meta: {
    status: number
    msg: string
  }
  response: T
}

export interface TumblrUserInfo {
  userUuid: string
  name: string
  email: string
  blogs: Blog[]
  isEmailVerified: boolean
}

interface Blog {
  name: string
  title: string
  avatar: Avatar[]
  primary: boolean
  uuid: string
  url: string
  followers: number
}

interface Avatar {
  width: number
  height: number
  url: string
}

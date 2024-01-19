import { texts } from '@textshq/platform-sdk'
/**
 * The cookie that tells us the auth cookies were set.
 */
export const AUTH_COOKIE = 'sid'

/**
 * Extra cookie that is set by tumblr that confirms the login was successful.
 */
export const LOGGED_IN_COOKIE = 'logged_in'

/**
 * The Tumblr API token. It is included in each API request as a `Authorization: Bearer {API_TOKEN}` header.
 * See: https://github.tumblr.net/Tumblr/redpop/blob/93a1f1b26c8808a85eff02dbfaf7a632032c5af4/src/server/middleware/configure-api-fetch.ts#L17
 */
export const API_TOKEN = 'aIcXSOoTtqrzR8L8YEIOmBeW94c3FmbSNSWAUbxsny9KKx5VFh'

/**
 * The headers that we include in each API request.
 */
export const REQUEST_HEADERS = {
  Accept: 'application/json;format=camelcase',
  'Accept-Encoding': 'gzip, deflate, br',
  'Content-Type': 'application/json',
  Authorization: `Bearer ${API_TOKEN}`,
  'User-Agent': texts.constants.USER_AGENT,
}

/**
 * The default, untitled blog name.
 */
export const UNTITLED_BLOG = 'Untitled'

/**
 * Base api url.
 */
const API_URL = 'https://www.tumblr.com/api/v2'

export const API_URLS = {
  BASE: API_URL,
  /**
   * User info url.
   */
  USER_INFO: `${API_URL}/user/info`,

  /**
   * Conversations url.
   */
  CONVERSATIONS: `${API_URL}/conversations`,
}

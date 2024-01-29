import { texts } from '@textshq/platform-sdk'

/**
 * Tumblr OAuth2 token refresh endpoint.
 */
export const OAUTH_TOKEN_REFRESH_URL = 'https://texts.com/api/tumblr/auth/refresh'

/**
 * The headers that we include in each API request.
 */
export const REQUEST_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'User-Agent': texts.constants.USER_AGENT,
}

/**
 * The default, untitled blog name.
 */
export const UNTITLED_BLOG = 'Untitled'

/**
 * The minimum amount of milliseconds the access token life time should have.
 */
export const ACCESS_TOKEN_MIN_TTL = 10_000

/*
 * Base api url.
 */
const API_URL = 'https://api.tumblr.com/v2'

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

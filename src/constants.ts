import { texts } from '@textshq/platform-sdk'

/**
 * Base api url.
 */
export const API_URL = 'https://api.tumblr.com/v2'

/**
 * Tumblr api key for Texts.com
 */
export const API_KEY = 'FFNa7UzNzJcAH7fB5ukHph9PxO2iF5QfNTw8YyosPwOP9Cxwmw'

/**
 * OAuth state parameter. Used to identify unique authorization requests.
 * The value is arbitrary and makes no difference for desktop app.
 */
export const OAUTH_STATE = 'texts.app.tumblr.oauth.state'

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

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
 * The value is arbitrary makes no difference for desktop app, because not
 * processed by the texts.com server.
 */
export const OAUTH_STATE = 'texts.app.tumblr.oauth.state'

/**
 * The regexpt string that matches the url that tumblr.com redirects to once the user grants texts.com required persmissions.
 */
export const OAUTH_REDIRECT_REGEX_STR = `https:\\/\\/texts.com\\/redirect\\/tumblr\\?code=([a-z0-9]+)&state=${OAUTH_STATE}#_=_`

/**
 * The headers that we include in each API request.
 */
export const REQUEST_HEADERS = {
  Accept: 'application/json;format=camelcase',
  'Accept-Encoding': 'gzip, deflate, br',
  'Content-Type': 'application/json',
  'User-Agent': texts.constants.USER_AGENT,
}

/**
 * The default, untitled blog name.
 */
export const UNTITLED_BLOG = 'Untitled'

import { texts } from '@textshq/platform-sdk'

/**
 * Tumblr OAuth2 token refresh endpoint.
 */
export const OAUTH_TOKEN_REFRESH_URL = 'https://texts.com/api/tumblr/auth/refresh'

/**
 * The headers that we include in each API request.
 */
export const REQUEST_HEADERS = {
  Accept: 'application/json;format=camelcase',
  'Content-Type': 'application/json',
  'User-Agent': texts.constants.USER_AGENT,
}

/**
 * The headers that we include for websocket channels
 * that listen to conversations.
 */
export const CHANNEL_HEADERS = {
  'User-Agent': texts.constants.USER_AGENT,
  Accept: '*/*',
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language': 'en-US,en;q=0.5',
  'Cache-Control': 'no-cache',
  DNT: '1',
  Origin: 'https://www.tumblr.com',
  Pragma: 'no-cache',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'websocket',
  'Sec-Fetch-Site': 'same-site',
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
  USER_INFO: `${API_URL}/user/info?fields[blogs]=avatar,name,title,url,description,uuid,?primary,?admin,?followers,messages,mention_key,theme`,

  /**
   * Conversations url.
   */
  CONVERSATIONS: `${API_URL}/conversations`,

  /**
   * Messages url.
   */
  MESSAGES: `${API_URL}/conversations/messages`,

  /**
   * Retrieves the number of unread messages for each conversation
   */
  UNREAD_COUNTS: `${API_URL}/user/counts?unread=true&unread_messages=true`,

  /**
   * Fetches the Tumblr blogs matching the query, with whom the user can start chatting
   */
  PARTICIPANT_SUGGESTIONS: `${API_URL}/conversations/participant_suggestions`,

  /**
   * Flags the Tumblr blog and blocks them
   */
  FLAG: `${API_URL}/conversations/flag`,

  /**
   * Marks the conversation as read
   */
  MARK_AS_READ: `${API_URL}/conversations/mark_as_read`,

  /**
   * Extracts url info for preview
   */
  URL_INFO: `${API_URL}/url_info`,
}

/**
 * Conversation channel event names.
 */
export const CHANNEL_EVENTS = {
  CONNECTION_ESTABLISHED: 'pusher:connection_established',
  SUBSCRIBE: 'pusher:subscribe',
  SUBSCRIPTION_SUCCEEDED: 'pusher_internal:subscription_succeeded',
  PING: 'pusher:ping',
  PONG: 'pusher:pong',
  NEW_MESSAGE: 'message:new',
}

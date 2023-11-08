import crypto from 'crypto'
import { CookieJar } from 'tough-cookie'
import util from 'util'
import { texts, ReAuthError, FetchOptions, RateLimitError } from '@textshq/platform-sdk'


const { constants, Sentry } = texts
const { USER_AGENT } = constants

const randomBytes = util.promisify(crypto.randomBytes)

const MAX_RETRY_COUNT = 5

const commonHeaders = {
  'Accept-Language': 'en',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-site',
  'User-Agent': USER_AGENT,
}

const staticFetchHeaders = {
  // Authorization: AUTHORIZATION,
  Accept: '*/*',
  'X-Twitter-Active-User': 'yes',
  'X-Twitter-Auth-Type': 'OAuth2Session',
  'X-Twitter-Client-Language': 'en',
  'Sec-Ch-Ua': '"Chromium";v="105", "Google Chrome";v="105", "Not;A=Brand";v="99"',
  'Sec-Ch-Ua-Mobile': '?0',
}


const EXT = 'mediaColor,altText,mediaStats,highlightedLabel,cameraMoment'


const API_ENDPOINT = 'https://www.tumblr.com/api/v2/'
const ENDPOINT = 'https://www.tumblr.com/'

export default class TumblrAPI {
  cookieJar: CookieJar = null

  httpClient = texts.createHttpClient()

  setLoginState = async (cookieJar: CookieJar) => {
    if (!cookieJar) throw TypeError()
    this.cookieJar = cookieJar
  }

  fetch = async (options: FetchOptions & {
    referer?: string
    url: string
    includeHeaders?: boolean
    dontThrow?: boolean
  }, retryNumber = 0) => {
    if (!this.cookieJar) throw new Error('tumblr cookie jar not found')
    // if (IS_DEV) console.log('[TW] CALLING', options.url)

    options.headers = {
      ...staticFetchHeaders,
      Referer: options.referer,
      ...commonHeaders,
      ...options.headers,
    }

    options.cookieJar = this.cookieJar

    try {
      const res = await this.httpClient.requestAsString(options.url, options)
      if (res.statusCode === 429) throw new RateLimitError()
      if (!res.body) {
        if (res.statusCode === 204) return
        throw Error('falsey body')
      }
      const json = JSON.parse(res.body)
      if (json.errors) {
        // if (retryNumber < MAX_RETRY_COUNT && json.errors[0]?.code === TwitterError.OverCapacity) {
        //   texts.log('[tumblr] retrying bc over capacity', { retryNumber }, options.url)
        //   await setTimeoutAsync(100 * retryNumber)
        //   return this.fetch(options, retryNumber + 1)
        // }
        if (!options.dontThrow) handleErrors(options.url, res.statusCode, json)
      }
      if (options.includeHeaders) return { headers: res.headers, json }
      return json
    } catch (err) {
      // if (err.code === 'ECONNREFUSED' && (err.message.endsWith('0.0.0.0:443') || err.message.endsWith('127.0.0.1:443'))) {
      //   console.log('twitter is blocked')
      //   throw Error('Twitter seems to be blocked on your device. This could have been done by an app or a manual entry in /etc/hosts')
      //   // this.twitterBlocked = true
      //   // await resolveHost(url)
      //   // return this.fetch({ headers, referer, ...rest })
      // }
      throw err
    }
  }

  authenticatedGet = async (url: string) => {
    if (!this.cookieJar) throw new Error('Not authorized')
    const res = await this.httpClient.requestAsBuffer(url, {
      cookieJar: this.cookieJar,
      headers: {
        Accept: 'image/webp,image/apng,image/*,*/*;q=0.8', // todo review for videos
        Referer: 'https://twitter.com/messages/',
        ...commonHeaders,
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'same-site',
      },
    })
    return res.body
  }
}

import PersistentWS, { WebSocketClientOptions } from '@textshq/platform-sdk/dist/PersistentWS'
import { texts } from '@textshq/platform-sdk'
import { CHANNEL_EVENTS } from '../constants'

export default class ConversationsChannel extends PersistentWS {
  /**
   * The ping pong interval timeout to keep the channel open
   */
  private activityTimeout = 30_000

  private stopPinging = false

  private pingTimeoutId: ReturnType<typeof setTimeout>

  private subscriptions: string[] = []

  constructor(
    getConnectionInfo: () => Promise<{ endpoint: string, options?: WebSocketClientOptions }>,
    onMessage: (msg: Buffer) => void,
    onOpen?: () => void,
    onClose?: (code?: number) => { retry: boolean } | void,
    onError?: (error: Error) => { retry: boolean } | void,
  ) {
    super(
      getConnectionInfo,
      (...args) => {
        onMessage(...args)
        this.onConnectionEstablished(...args)
        this.stopPinging = false
        this.ping()
      },
      onOpen,
      (...args) => {
        this.stopPinging = true
        return onClose?.(...args)
      },
      (...args) => {
        this.stopPinging = true
        return onError?.(...args)
      },
    )
  }

  subscribeToMessages(conversationId: string, blogName: string) {
    const message = JSON.stringify({ event: 'pusher:subscribe', data: { auth: '', channel: `private-messaging-${conversationId}-${blogName}.tumblr.com` } })
    this.send(message)
  }

  onSubscriptionSucceeded(buffer: Buffer) {
    const message = JSON.parse(`${buffer}`)
    if (message?.event !== CHANNEL_EVENTS.SUBSCRIPTION_SUCCEEDED) {
      return
    }

    if (!message.channel) {
      return
    }

    this.subscriptions.push(message.channel)
  }

  onConnectionEstablished(buffer: Buffer) {
    const message = JSON.parse(`${buffer}`)
    if (message.event !== CHANNEL_EVENTS.CONNECTION_ESTABLISHED) {
      return
    }
    const activityTimeout = parseInt(message.data.activity_timeout, 10) * 1000
    if (!Number.isNaN(activityTimeout)) {
      this.activityTimeout = message.data.activity_timeout
    }
  }

  async ping() {
    if (this.pingTimeoutId) {
      clearTimeout(this.pingTimeoutId)
    }

    if (this.stopPinging) {
      return
    }

    this.pingTimeoutId = setTimeout(() => {
      this.send(JSON.stringify({ event: CHANNEL_EVENTS.PING, data: {} }))

      this.ping()
    }, this.activityTimeout)
  }

  static parseConversationChannelString(details: string) {
    const regex = /private-messaging-(?<conversationId>[0-9]+)-(?<blogName>[0-9a-zA-Z.]+).tumblr.com/g
    const result = [...details.matchAll(regex)]
    const { conversationId = '', blogName = '' } = result[0]?.groups || {}

    if (!conversationId || !blogName) {
      texts.error(`Was not able to parse conversation details from: ${details}.`)
    }

    return {
      conversationId,
      blogName,
    }
  }
}

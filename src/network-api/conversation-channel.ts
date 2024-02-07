import WS from 'ws'
import { texts } from '@textshq/platform-sdk'
import { CHANNEL_EVENTS } from '../constants'

export default class ConversationsChannel extends WS {
  /**
   * The ping pong interval timeout to keep the channel open
   */
  private activityTimeout = 30_000

  private pingTimeoutId: ReturnType<typeof setTimeout>

  private subscriptions: string[] = []

  constructor(
    address: string,
    options: WS.ClientOptions,
  ) {
    super(address, options)
    this.on('message', this.onConnectionEstablished)
    this.on('message', this.onSubscriptionSucceeded)
    this.on('message', this.ping)
  }

  listenToConversation(conversationId: string, blogName: string) {
    const channel = `private-messaging-${conversationId}-${blogName}.tumblr.com`
    if (this.subscriptions.includes(channel)) {
      return
    }
    const message = JSON.stringify({ event: CHANNEL_EVENTS.SUBSCRIBE, data: { auth: '', channel } })
    if (this.readyState === WS.OPEN) {
      this.send(message)
    } else {
      this.on('open', () => this.send(message))
    }
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

    this.pingTimeoutId = setTimeout(() => {
      if (this.readyState === WS.CLOSED || this.readyState === WS.CLOSING) {
        return
      }

      if (this.readyState === WS.CONNECTING) {
        this.ping()
        return
      }

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

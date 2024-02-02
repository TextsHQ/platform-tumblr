import WS from 'ws'
import { CHANNEL_EVENTS } from '../constants'

const delay = (milliseconds: number) => new Promise(resolve => {
  setTimeout(resolve, milliseconds)
})

export default class ConversationChannel extends WS {
  /**
   * The ping pong interval timeout to keep the channel open
   */
  private activityTimeout = 30_000

  private keepAlive = true

  constructor(
    address: string,
    private readonly conversationId: string,
    private readonly blogName: string,
    options: WS.ClientOptions,
  ) {
    super(address, options)
    this.on('open', this.subscribeToEvents)
    this.on('message', this.onConnectionEstablished)
  }

  subscribeToEvents() {
    this.send(JSON.stringify({ event: 'pusher:subscribe', data: { auth: '', channel: `private-messaging-${this.conversationId}-${this.blogName}.tumblr.com` } }))
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
    this.ping()
  }

  async ping() {
    await delay(this.activityTimeout)

    if (this.readyState === WS.CLOSED || this.readyState === WS.CLOSING) {
      return
    }

    if (this.readyState === WS.CONNECTING) {
      this.ping()
      return
    }

    this.send(JSON.stringify({ event: CHANNEL_EVENTS.PING, data: {} }))

    this.ping()
  }
}

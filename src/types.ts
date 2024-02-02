import { FetchResponse } from '@textshq/platform-sdk'
import ConversationChannel from './network-api/ConversationChannel'

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
  activeBlog: Blog
  isEmailVerified: boolean
}

export interface Blog {
  name: string
  title: string
  avatar: Avatar[]
  primary: boolean
  uuid: string
  url: string
  followers: number
  shareFollowing: boolean
  description?: string
  theme?: BlogTheme
}

interface BlogTheme {
  headerImage: string
}

interface Avatar {
  width: number
  height: number
  url: string
}

export interface Conversation {
  objectType: 'conversation' | 'message'
  id: number | string
  status: ConversationStatus
  lastModifiedTs: number
  lastReadTs: number
  unreadMessagesCount: number
  canSend: boolean
  isPossibleSpam: boolean
  isBlurredImages: boolean
  participants: Blog[]
  messages: MessagesObject
}

export type ConversationStatus = 'ACTIVE' | 'INACTIVE'

export interface MessagesObject {
  data: Message[]
  links?: ApiLinks
}

export interface ApiLink {
  href: string
}

export interface ApiLinks {
  destination?: ApiLink
  next?: ApiLink
  prev?: ApiLink
}

export interface Message {
  type: 'TEXT' | 'IMAGE' | 'STICKER' | 'POSTREF'
  participant: string // matches to Blog.uuid
  ts: string
  unread?: boolean
  content?: TextContent
  post?: Post | GIFPost
  images?: MessageImage[]
  pendingTs?: string
  canRetry?: boolean
  isPending?: boolean
  isRetrying?: boolean
  /** This message was unable to be sent and cannot explictly be retried */
  couldNotSend?: boolean
  stickerId?: string
}

export type GIFPost = Post & {
  type: 'image'
  content: ImageBlock[]
}

export interface TextContent {
  text: string
  formatting?: TextFormattingRange[]
}

interface TextFormattingRange {
  type: 'bold' | 'italic' | 'strikethrough' | 'link' | 'mention' | 'color' | 'small'
  position: { [index: number]: number }
}

export interface Post {
  blog: Blog
  blogName: string
  postUrl: string
  content: Block[]
  type: string
  shortUrl?: string
  summary?: string
}

export type Block = TextBlock | ImageBlock

export interface TextBlock {
  type: 'text'
  text: string
}

export interface ImageBlock {
  type: 'image'
  media: Media[]
  altText?: string
  caption?: string
}

export interface Media {
  mediaKey: string
  type: MimeType
  width: number
  height: number
  poster?: Media
  url: string
  hasOriginalDimension?: boolean
}

export interface Image {
  width: number
  height: number
  url: string
  type?: MimeType
}

type MimeType = 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp'

export type ImageAsVideo = Image & {
  type: 'video/mp4'
}

interface MessageImage {
  altSizes: Image[]
  originalSize: Image
}

export interface ConversationChannelConnecting {
  connected: false
}

export interface ConversationChannelConnected {
  channel: ConversationChannel
  connected: true
}

import { FetchResponse } from '@textshq/platform-sdk'

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
  description?: string
}

interface Avatar {
  width: number
  height: number
  url: string
}

export interface Conversation {
  objectType: 'conversation' | 'message'
  id: number | string
  status: 'ACTIVE' | 'INACTIVE'
  lastModifiedTs: number
  lastReadTs: number
  unreadMessagesCount: number
  canSend: boolean
  isPossibleSpam: boolean
  isBlurredImages: boolean
  participants: Blog[]
  messages: MessagesObject
}

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
}

export type Block = TextBlock | ImageBlock

export const isTextBlock = (block: TextBlock | ImageBlock): block is TextBlock => {
  const textBlock = block as TextBlock
  return !!textBlock.text
}

export interface TextBlock {
  text: string
}

export interface ImageBlock {
  media: Image[]
  altText?: string
  caption?: string
}

export interface Image {
  poster?: BaseImage
  video?: ImageAsVideo[]
}

export interface BaseImage {
  width: number
  height: number
  url: string
  type: 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp'
}

export type ImageAsVideo = BaseImage & {
  type: 'video/mp4'
}

interface MessageImage {
  altSizes: Image[]
  originalSize: Image
}

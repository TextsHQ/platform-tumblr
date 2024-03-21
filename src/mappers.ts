import path from 'path'
import * as fs from 'fs/promises'
import {
  Attachment, AttachmentType, CurrentUser, Message, MessageContent, MessageID, MessageLink,
  Paginated, PaginatedWithCursors, Participant, Thread, User, UserSocialAttributes,
} from '@textshq/platform-sdk'
import {
  Conversation, TumblrUserInfo, Message as TumblrMessage, MessagesObject as TumblrMessages,
  Blog, ApiLinks, OutgoingMessage, OutgoingMessageToCreateConversation,
} from './types'
import { UNTITLED_BLOG } from './constants'
import type { TumblrClient } from './network-api'

const mapUserSocialAttributes = (blog: Blog): UserSocialAttributes => {
  const social: UserSocialAttributes = {
    coverImgURL: blog.theme?.headerImage,
    bio: {
      text: blog.description,
    },
    website: blog.url,
  }

  if (blog.shareFollowing) {
    social.followers = {
      count: blog.followers,
    }
  }

  return social
}

export const mapCurrentUser = (user: TumblrUserInfo): CurrentUser => {
  const { activeBlog } = user
  const activeBlogTitle = activeBlog.title && activeBlog.title !== UNTITLED_BLOG
    ? activeBlog.title
    : user.name
  const avatarUrl = activeBlog.avatar[0]?.url
  return {
    ...user,
    displayText: activeBlogTitle,
    id: activeBlog.uuid,
    username: user.name,
    email: user.email,
    fullName: user.name,
    nickname: user.name,
    imgURL: avatarUrl,
    isVerified: user.isEmailVerified,
    social: mapUserSocialAttributes(activeBlog),
  }
}

const getBlogForConversation = (conversation: Conversation, currentUser: TumblrUserInfo): Blog => {
  for (const userBlog of currentUser.blogs) {
    for (const conversationBlog of conversation.participants) {
      if (userBlog.uuid === conversationBlog.uuid) {
        return userBlog
      }
    }
  }
}

export const findLastReadMessageID = (messageIDs: MessageID[], lastReadTs: number): MessageID =>
  messageIDs.slice(0).reverse().find(tsStr => {
    const ts = parseInt(tsStr, 10)
    return !Number.isNaN(ts) && ts < lastReadTs * 1000
  })

export const getLastReadMessageID = (conversation: Conversation): string => findLastReadMessageID(
  conversation.messages.data.map(message => message.ts),
  conversation.lastReadTs,
)

/**
 * Tries to infer if the message is seen or not from the optional
 * TumblrMessage.unread property.
 */
const isMessageSeen = (message: TumblrMessage): boolean | undefined => {
  // We don't know if the message is seen or not if there is no
  // message.unread property.
  if (typeof message.unread === 'undefined') {
    return undefined
  }

  return !message.unread
}

/**
 * Detects if the message is NOT delivered. Cannot tell if the message IS delivered.
 */
const isMessageDelivered = (message: TumblrMessage): false | undefined => {
  if (message.couldNotSend || message.isPending || message.isRetrying) {
    return false
  }
}

const timestampToDate = (timestamp: string | number): Date => {
  const timestampInt = parseInt(`${timestamp}`, 10)
  if (Number.isNaN(timestampInt)) {
    return new Date()
  }
  return new Date(timestampInt)
}

const mapImageToAttachment = (image: TumblrMessage['images'][0]): Attachment => {
  if (!image.originalSize) return
  const img = image.originalSize
  return {
    id: img.url,
    type: AttachmentType.IMG,
    size: {
      width: img.width,
      height: img.height,
    },
    mimeType: img.type,
    isGif: img.type === 'image/gif',
    srcURL: img.url,
  }
}

interface MapPostToMessageReturns {
  attachments: Attachment[]
  links: MessageLink[]
  textHeading: string
}

const mapPostToMessage = (message: TumblrMessage): MapPostToMessageReturns => {
  const result: MapPostToMessageReturns = {
    attachments: [],
    links: [],
    textHeading: '',
  }
  if (message.post?.content) {
    for (const block of message.post.content) {
      if (block.type === 'text' && !message.post.summary) {
        result.textHeading = block.text
      } else if (block.type === 'image') {
        result.textHeading = block.caption
        const media = block.media[0]
        if (media) {
          result.attachments.push({
            id: media.mediaKey || media.url,
            srcURL: media.url,
            type: AttachmentType.IMG,
            size: {
              width: media.width,
              height: media.height,
            },
            posterImg: media.poster?.url,
            mimeType: media.type,
            isGif: media.type === 'image/gif',
          })
        }
      }
    }
  }
  if (message.post.postUrl) {
    result.links.push({
      url: message.post.postUrl,
      title: message.post.summary || '',
    })
  }

  return result
}

export const mapMessage = (message: TumblrMessage, currentUserBlog: Blog): Message => {
  const result: Message = {
    id: message.ts,
    timestamp: timestampToDate(message.ts),
    senderID: message.participant,
    text: message.content?.text,
    seen: isMessageSeen(message),
    isDelivered: isMessageDelivered(message),
    isSender: message.participant === currentUserBlog.uuid,
    isErrored: message.couldNotSend,
  }

  if (message.type === 'IMAGE') {
    return {
      ...result,
      attachments: message.images?.map(mapImageToAttachment).filter(i => i),
    }
  } if (message.type === 'POSTREF') {
    return {
      ...result,
      ...mapPostToMessage(message),
    }
  }

  return result
}

export const mapPaginatedMessages = (messages: TumblrMessages, blog: Blog): PaginatedWithCursors<Message> => ({
  items: messages.data.map(message => mapMessage(message, blog)),
  hasMore: !!messages.data.length,
  oldestCursor: messages.data[0]?.ts,
  newestCursor: messages.data[messages.data.length - 1]?.ts,
})

const mapPaginatedParticipants = (conversation: Conversation, currentUserBlog: Blog): Paginated<Participant> => ({
  items: conversation.participants.map((participant: Blog): Participant => ({
    id: participant.uuid,
    username: participant.name,
    nickname: participant.name,
    imgURL: participant.avatar[0]?.url,
    isSelf: participant.uuid === currentUserBlog.uuid,
    social: mapUserSocialAttributes(participant),
  })).filter(participant => !participant.isSelf),
  hasMore: false,
})

export const mapThread = (conversation: Conversation, currentUser: TumblrUserInfo): Thread => {
  const blogForConversation = getBlogForConversation(conversation, currentUser)
  const lastReadMessageID = getLastReadMessageID(conversation)

  return ({
    folderName: 'normal',
    id: conversation.id,
    isUnread: !!conversation.unreadMessagesCount,
    /** ID of the last message that the current user has read */
    lastReadMessageID,
    /** If true, messages cannot be sent in the thread */
    isReadOnly: !conversation.canSend,
    isArchived: conversation.status === 'INACTIVE',
    type: 'single',
    /** If null, thread won't be visible to the user in the UI unless they explicitly search for it  */
    timestamp: new Date(conversation.lastModifiedTs),
    messages: mapPaginatedMessages(conversation.messages, blogForConversation),
    participants: mapPaginatedParticipants(conversation, blogForConversation),
  })
}

export const mapPaginatedThreads = ({
  conversations,
  links,
  currentUser,
}: {
  conversations: Conversation[]
  links?: ApiLinks
  currentUser: TumblrUserInfo
}): PaginatedWithCursors<Thread> => ({
  items: conversations.map(conversation => mapThread(conversation, currentUser)),
  hasMore: !!links?.next?.href || !!links?.prev?.href,
  oldestCursor: links?.next?.href || links?.prev?.href,
})

/**
 * Matches the blog name and a post id from a tumblr post url.
 *
 * Handles different variations of the post urls. Like:
 * 'https://nurguly.tumblr.com/729164932829052928',
 * 'http://nurguly.tumblr.com/729164932829052928',
 * 'https://tumblr.com/nurguly/729164932829052928',
 * 'https://tumblr.com/nurguly/729164932829052928?source=share',
 * 'https://tumblr.com/nurguly/729164932829052928/seo-friendly-name-of-the-post',
 * 'https://www.tumblr.com/nurguly/729164932829052928',
 * 'https://nu_rg-uly.tumblr.com/729164932829052928',
 * 'https://tumblr.com/nu_rg-uly/729164932829052928',
 */
const tumblrPostUrlRegex = /(?:http|https)?:\/\/(?:www\.)?(?:(?<blogNameAsSubdomain>[0-9,a-z,A-Z_-]+)\.)?tumblr\.com\/(?:(?<blogNameAsPath>[0-9,a-z,A-Z_-]+)\/)?(?<postId>\d+).*/g

/**
 * Extracts the blog name and a post id from a tumblr post url.
 */
export const parseTumblrPostUrl = (url = ''): { blogName?: string, postId?: string } => {
  const result = url.matchAll(tumblrPostUrlRegex)
  const { blogNameAsSubdomain, blogNameAsPath, postId } = [...result][0]?.groups || {}
  return {
    blogName: blogNameAsSubdomain || blogNameAsPath,
    postId,
  }
}

export const mapMessageContentToOutgoingMessage = async (conversationId: string, blog: { uuid: string }, content: MessageContent, network: TumblrClient): Promise<OutgoingMessage> => {
  if (content.filePath || content.fileBuffer) {
    let data: File | Buffer
    let filename = ''
    if (content.fileBuffer) {
      filename = content.fileName
      data = content.fileBuffer
    } else if (content.filePath) {
      filename = content.fileName || path.basename(content.filePath)
      data = await fs.readFile(content.filePath)
    }
    return {
      type: 'IMAGE',
      conversation_id: conversationId,
      participant: blog.uuid,
      data,
      filename,
    }
  }

  const { link, includePreview } = content.links?.[0] || { includePreview: false, link: '' }
  const { blogName, postId } = parseTumblrPostUrl(link)
  if (includePreview && link && blogName && postId) {
    const { json: urlInfo } = await network.getUrlInfo(link)
    const { json: postBlog } = await network.getBlogInfo(blogName)
    if (urlInfo && postBlog) {
      const posterType = urlInfo.poster?.[0]?.type || ''
      return {
        type: 'POSTREF',
        conversation_id: conversationId,
        message: '',
        participant: blog.uuid,
        context: posterType === 'image/gif' ? 'messaging-gif' : 'post-chrome',
        post: {
          id: postId,
          blog: postBlog.uuid,
          type: 'post',
        },
      }
    }
  }

  return {
    conversation_id: conversationId,
    type: 'TEXT',
    participant: blog.uuid,
    message: content.text,
  }
}

export const mapMessageContentForNewConversations = async (participants: string[], content: MessageContent, network: TumblrClient): Promise<OutgoingMessageToCreateConversation> => {
  const outgoingMessage = await mapMessageContentToOutgoingMessage('', { uuid: participants[0] }, content, network)
  delete outgoingMessage.conversation_id
  return {
    ...outgoingMessage,
    participants,
  }
}

export const mapBlogToUser = (blog: Blog): User => ({
  id: blog.uuid,
  username: blog.name,
  fullName: blog.name,
  imgURL: blog.avatar[0]?.url,
  isSelf: false,
  social: mapUserSocialAttributes(blog),
})

export const mapBlogNameToNetworkDomain = (blogName: string) => `${blogName}.tumblr.com`

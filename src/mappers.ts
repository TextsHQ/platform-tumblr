import path from 'path'
import * as fs from 'fs/promises'
import {
  Attachment, AttachmentType, CurrentUser, Message, MessageContent, MessageLink,
  Paginated, PaginatedWithCursors, Participant, Thread, User, UserSocialAttributes,
} from '@textshq/platform-sdk'
import { Conversation, TumblrUserInfo, Message as TumblrMessage, MessagesObject as TumblrMessages, Blog, ApiLinks, OutgoingMessage } from './types'
import { UNTITLED_BLOG } from './constants'

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

const getLastReadMessageID = (conversation: Conversation): string => conversation.messages.data.find(message => {
  const ts = parseInt(message.ts, 10)
  return !Number.isNaN(ts) && ts > conversation.lastReadTs
})?.ts

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
            id: media.mediaKey,
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
    id: `${conversation.id}`,
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

export const mapMessageContentToOutgoingMessage = async (conversationId: string, blog: Blog, content: MessageContent): Promise<OutgoingMessage> => {
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
      conversationId,
      participant: blog.uuid,
      data,
      filename,
    }
  }

  return {
    conversation_id: conversationId,
    type: 'TEXT',
    participant: blog.uuid,
    message: content.text,
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

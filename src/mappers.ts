import { CurrentUser, Message, Paginated, Participant, Thread, UserSocialAttributes } from '@textshq/platform-sdk'
import { Conversation, TumblrUserInfo, Message as TumblrMessage, MessagesObject as TumblrMessages, isTextBlock, Block, Blog, ApiLinks } from './types'
import { UNTITLED_BLOG } from './constants'

const mapUserSocialAttributes = (blog: Blog): UserSocialAttributes => ({
  coverImgURL: blog.avatar[0]?.url,
  bio: {
    text: blog.description,
  },
  website: blog.url,
  followers: {
    count: blog.followers,
  },
})

export const mapCurrentUser = (user: TumblrUserInfo): CurrentUser => {
  const primaryBlog = user.blogs.find(({ primary }) => primary)
  const primaryBlogTitle = primaryBlog.title && primaryBlog.title !== UNTITLED_BLOG
    ? primaryBlog.title
    : user.name
  const avatarUrl = primaryBlog.avatar[0]?.url
  return {
    ...user,
    displayText: primaryBlogTitle,
    id: user.userUuid,
    username: user.name,
    email: user.email,
    fullName: user.name,
    nickname: user.name,
    imgURL: avatarUrl,
    isVerified: user.isEmailVerified,
    social: mapUserSocialAttributes(primaryBlog),
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
 * Returns a crude string representation of the TumblrMessage object.
 *
 * @todo Not a final implementation. Update when the support for attachments/images
 * are introduced.
 */
export const mapMessageText = (message: TumblrMessage): string => {
  if (message.type === 'TEXT') {
    return message.content.text
  } if (message.type === 'POSTREF') {
    const { content } = message.post
    return content.reduce((result: string, block: Block) => {
      if (isTextBlock(block)) {
        return `${result}\n${block.text}`
      }
      /**
       * @todo Below needs further mapping.
       */
      return `${result}\n  image: ${block.media[0].poster?.url}`
    }, '')
  }

  return ''
}

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

export const mapMessage = (message: TumblrMessage, currentUserBlog: Blog): Message => ({
  id: message.ts,
  timestamp: timestampToDate(message.ts),
  senderID: message.participant,
  text: mapMessageText(message),
  seen: isMessageSeen(message),
  isDelivered: isMessageDelivered(message),
  isSender: message.participant === currentUserBlog.uuid,
  isErrored: message.couldNotSend,
})

export const mapPaginatedMessages = (messages: TumblrMessages, blog: Blog): Paginated<Message> => ({
  items: messages.data.map(message => mapMessage(message, blog)),
  hasMore: !!messages.links?.next?.href,
})

const mapPaginatedPerticipants = (conversation: Conversation, currentUserBlog: Blog): Paginated<Participant> => ({
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
    isReadOnly: conversation.canSend,
    isArchived: conversation.status === 'INACTIVE',
    type: 'single',
    /** If null, thread won't be visible to the user in the UI unless they explicitly search for it  */
    timestamp: new Date(conversation.lastModifiedTs),
    messages: mapPaginatedMessages(conversation.messages, blogForConversation),
    participants: mapPaginatedPerticipants(conversation, blogForConversation),
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
}): Paginated<Thread> => ({
  items: conversations.map(conversation => mapThread(conversation, currentUser)),
  hasMore: !!links?.next?.href || !!links?.prev?.href,
  oldestCursor: links?.next?.href,
  newestCursor: links?.prev?.href,
})

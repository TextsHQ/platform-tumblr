import {
  ActivityType, Awaitable, CurrentUser, CustomEmojiMap, FetchInfo, LoginCreds,
  LoginResult, Message, MessageContent, MessageLink, MessageSendOptions, OnConnStateChangeCallback,
  OnServerEventCallback, Paginated, PaginationArg, Participant, PlatformAPI, PresenceMap,
  SearchMessageOptions, Thread, User, OnLoginEventCallback, ThreadFolderName,
  ThreadID, StickerPack, StickerPackID, Attachment, MessageID, UserID, PhoneNumber, AttachmentID,
  NotificationsInfo, GetAssetOptions, FetchURL, Asset, AssetInfo, PaginatedWithCursors,
} from '@textshq/platform-sdk'
import type { Readable } from 'stream'

import { TumblrClient } from './network-api'
import type { AuthCredentialsWithDuration, AuthCredentialsWithExpiration } from './types'
import { mapBlogToUser, mapCurrentUser, mapMessage, mapMessageContentForNewConversations, mapMessageContentToOutgoingMessage, mapPaginatedMessages, mapPaginatedThreads, mapThread } from './mappers'

export default class TumblrPlatformAPI implements PlatformAPI {
  readonly network = new TumblrClient()

  /**
   * Called after new PlatformAPI()
   * @param session - return value of `serializeSession`, `undefined` if not logged in
   */
  init = (session: { creds?: AuthCredentialsWithExpiration }) => {
    if (session?.creds) {
      this.network.setAuthCreds(session.creds)
      this.network.pollUnreadCounts()
    }
  }

  /**
   * `dispose` disconnects all network connections and cleans up.
   * Called when user disables account and when app exits.
   */
  dispose = async () => {
    this.network.dispose()
  }

  subscribeToEvents = (onEvent: OnServerEventCallback) => {
    this.network.eventCallback = onEvent
    if (this.network.pendingEventsQueue.length > 0) {
      onEvent(this.network.pendingEventsQueue)
      this.network.pendingEventsQueue = []
    }
  }

  onLoginEvent?: (onEvent: OnLoginEventCallback) => Awaitable<void>

  onConnectionStateChange?: (
    onEvent: OnConnStateChangeCallback
  ) => Awaitable<void>

  getCurrentUser = async (): Promise<CurrentUser> => {
    const currentUser = await this.network.getCurrentUser()
    return mapCurrentUser(currentUser)
  }

  login = async (creds?: LoginCreds): Promise<LoginResult> => {
    const jsCodeResult = (creds as { jsCodeResult?: string })?.jsCodeResult

    if (!jsCodeResult) {
      return {
        type: 'error',
        errorMessage: "We couldn't find your account.",
      }
    }

    const authResult: {
      success: boolean
      credentials: AuthCredentialsWithDuration
    } = JSON.parse(jsCodeResult)

    if (!authResult.success || !authResult.credentials) {
      return {
        type: 'error',
        errorMessage: 'Login Failed.',
      }
    }

    this.network.setAuthCreds(authResult.credentials)

    return {
      type: 'success',
    }
  }

  /**
   * `logout` logs out the user from the platform's servers,
   * session should no longer be valid. Called when user clicks logout.
   * */
  logout?: () => Awaitable<void>

  serializeSession = () => ({ creds: this.network.getAuthCreds() })

  searchUsers = async (typed: string): Promise<User[]> => {
    const { json: { blogs } } = await this.network.getParticipantSuggestions(typed)
    return blogs.map(mapBlogToUser)
  }

  searchThreads?: (typed: string) => Awaitable<Thread[]>

  searchMessages?: (typed: string, pagination?: PaginationArg, options?: SearchMessageOptions) => Awaitable<PaginatedWithCursors<Message>>

  getPresence?: () => Awaitable<PresenceMap>

  getCustomEmojis?: () => Awaitable<CustomEmojiMap>

  getThreads = async (folderName: ThreadFolderName, pagination?: PaginationArg): Promise<PaginatedWithCursors<Thread>> => {
    const response = await this.network.getConversations(pagination)
    const currentUser = await this.network.getCurrentUser()
    const { conversations, links } = response.json
    return mapPaginatedThreads({ conversations, links, currentUser })
  }

  /** Messages should be sorted by timestamp asc → desc */
  getMessages = async (threadID: ThreadID, pagination?: PaginationArg): Promise<Paginated<Message>> => {
    const currentUser = await this.network.getCurrentUser()
    const response = await this.network.getMessages({
      conversationId: threadID,
      blogName: currentUser.activeBlog.name,
      pagination,
    })
    return mapPaginatedMessages(response.json.messages, currentUser.activeBlog)
  }

  sendMessage = async (threadID: ThreadID, content: MessageContent): Promise<boolean | Message[]> => {
    const currentUser = await this.network.getCurrentUser()
    if (!currentUser?.activeBlog?.uuid) {
      throw Error('User credentials are absent. Try reauthenticating.')
    }

    const body = await mapMessageContentToOutgoingMessage(threadID, currentUser.activeBlog, content)
    const response = await this.network.sendMessage(body)
    return response.json.messages.data.map(message => mapMessage(message, currentUser.activeBlog))
  }

  getThreadParticipants?: (threadID: ThreadID, pagination?: PaginationArg) => Awaitable<PaginatedWithCursors<Participant>>

  getStickerPacks?: (pagination?: PaginationArg) => Awaitable<PaginatedWithCursors<StickerPack>>

  getStickers?: (stickerPackID: StickerPackID, pagination?: PaginationArg) => Awaitable<PaginatedWithCursors<Attachment>>

  getThread = async (threadID: ThreadID): Promise<Thread | undefined> => {
    const user = await this.network.getCurrentUser()
    const response = await this.network.getMessages({
      conversationId: threadID,
      blogName: user.activeBlog.name,
    })
    return mapThread(response.json, user)
  }

  getMessage?: (threadID: ThreadID, messageID: MessageID) => Awaitable<Message | undefined>

  getUser = async (ids: | { userID: UserID } | { username: string } | { phoneNumber: PhoneNumber } | { email: string }): Promise<User | undefined> => {
    const { userID } = ids as { userID: UserID }
    if (!userID) {
      return
    }
    const response = await this.network.getUser(userID)
    return mapBlogToUser(response.json.user)
  }

  createThread = async (userIDs: UserID[], title?: string, messageText?: string): Promise<boolean | Thread> => {
    const currentUser = await this.network.getCurrentUser()
    const body = await mapMessageContentForNewConversations([currentUser.activeBlog.uuid, ...userIDs], { text: messageText })
    const response = await this.network.createConversation(body)
    return mapThread(response.json, currentUser)
  }

  updateThread?: (threadID: ThreadID, updates: Partial<Thread>) => Awaitable<void>

  deleteThread = async (threadID: ThreadID): Promise<void> => {
    await this.network.deleteConversation(threadID)
  }

  reportThread = async (type: 'spam', threadID: ThreadID): Promise<boolean> => {
    await this.network.markAsSpam(threadID)
    await this.deleteThread(threadID)
    return true
  }

  editMessage?: (threadID: ThreadID, messageID: MessageID, content: MessageContent, options?: MessageSendOptions) => Promise<boolean | Message[]>

  forwardMessage?: (threadID: ThreadID, messageID: MessageID, threadIDs?: ThreadID[], userIDs?: UserID[]) => Promise<void>

  sendActivityIndicator: (type: ActivityType, threadID?: ThreadID) => Awaitable<void>

  deleteMessage?: (threadID: ThreadID, messageID: MessageID, forEveryone?: boolean) => Awaitable<void>

  sendReadReceipt: (threadID: ThreadID, messageID: MessageID, messageCursor?: string) => Awaitable<void>

  addReaction?: (threadID: ThreadID, messageID: MessageID, reactionKey: string) => Awaitable<void>

  removeReaction?: (threadID: ThreadID, messageID: MessageID, reactionKey: string) => Awaitable<void>

  getLinkPreview?: (link: string) => Awaitable<MessageLink | undefined>

  addParticipant?: (threadID: ThreadID, participantID: UserID) => Awaitable<void>

  removeParticipant?: (threadID: ThreadID, participantID: UserID) => Awaitable<void>

  changeParticipantRole?: (threadID: ThreadID, participantID: UserID, role: 'admin' | 'regular') => Awaitable<void>

  changeThreadImage?: (threadID: ThreadID, imageBuffer: Buffer, mimeType: string) => Awaitable<void>

  markAsUnread?: (threadID: ThreadID, messageID?: MessageID) => Awaitable<void>

  archiveThread?: (threadID: ThreadID, archived: boolean) => Awaitable<void>

  pinThread?: (threadID: ThreadID, pinned: boolean) => Awaitable<void>

  notifyAnyway?: (threadID: ThreadID) => Awaitable<void>

  /** called by the client when an attachment (video/audio/image) is marked as played by user */
  markAttachmentPlayed?: (attachmentID: AttachmentID, messageID?: MessageID) => Awaitable<void>

  onThreadSelected = async (threadID: ThreadID) => {
    this.network.setUnreadCountsPollingInterval(threadID ? 5000 : 10_000)
  }

  loadDynamicMessage?: (message: Message) => Awaitable<Partial<Message>>

  registerForPushNotifications?: (type: keyof NotificationsInfo, token: string) => Awaitable<void>

  unregisterForPushNotifications?: (type: keyof NotificationsInfo, token: string) => Awaitable<void>

  getAsset?: (fetchOptions?: GetAssetOptions, ...args: string[]) => Awaitable<FetchURL | FetchInfo | Buffer | Readable | Asset>

  /** `getAssetInfo` must be implemented if getAsset supports fetchOptions.range */
  getAssetInfo?: (fetchOptions?: GetAssetOptions, ...args: string[]) => Awaitable<AssetInfo>

  /** `getOriginalObject` returns the JSON representation of the original thread or message */
  getOriginalObject = async (objName: 'thread' | 'message', objectID: ThreadID | MessageID): Promise<string> => {
    if (objName !== 'thread') {
      return ''
    }

    const user = await this.network.getCurrentUser()
    const response = await this.network.getMessages({
      conversationId: objectID,
      blogName: user.activeBlog.name,
    })

    return JSON.stringify(response.json, null, 2)
  }

  handleDeepLink?: (link: string) => void

  /** reconnect any websocket, mqtt or network connections since client thinks it's likely to have broken */
  reconnectRealtime?: () => void
}

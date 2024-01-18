import {
  ActivityType, Awaitable, CurrentUser, CustomEmojiMap, FetchInfo, LoginCreds,
  LoginResult, Message, MessageContent, MessageLink, MessageSendOptions, OnConnStateChangeCallback,
  OnServerEventCallback, Paginated, PaginationArg, Participant, PlatformAPI, PresenceMap,
  SearchMessageOptions, Thread, User, OverridablePlatformInfo, OnLoginEventCallback, ThreadFolderName,
  ThreadID, StickerPack, StickerPackID, Attachment, MessageID, UserID, PhoneNumber, AttachmentID,
  NotificationsInfo, GetAssetOptions, FetchURL, Asset, AssetInfo,
} from '@textshq/platform-sdk'
import type { Readable } from 'stream'

import { CookieJar } from 'tough-cookie'
import { TumblrClient } from './network-api'
import { mapUserInfo } from './mappers'

export default class TumblrPlatformAPI implements PlatformAPI {
  readonly tumblrClient = new TumblrClient()

  currentUser: CurrentUser = null

  /**
   * Called after new PlatformAPI()
   * @param session - return value of `serializeSession`, `undefined` if not logged in
   */
  init = async (session?: { cookies?: CookieJar.Serialized }) => {
    const serializedCookieJar: CookieJar.Serialized = session?.cookies
    if (!serializedCookieJar) {
      return
    }

    await this.tumblrClient.setLoginState(serializedCookieJar)
  }

  /** `dispose` disconnects all network connections and cleans up. Called when user disables account and when app exits. */
  dispose: () => Awaitable<void>

  static getPlatformInfo = async (): Promise<Partial<OverridablePlatformInfo>> => ({
    reactions: {
      supported: {},
      canReactWithAllEmojis: false,
      allowsMultipleReactionsToSingleMessage: false,
    },
    attachments: {
      noSupportForVideo: true,
      noSupportForAudio: true,
      noSupportForFiles: true,
    },
  })

  subscribeToEvents: (onEvent: OnServerEventCallback) => Awaitable<void>

  onLoginEvent?: (onEvent: OnLoginEventCallback) => Awaitable<void>

  onConnectionStateChange?: (
    onEvent: OnConnStateChangeCallback
  ) => Awaitable<void>

  getCurrentUser = async (): Promise<CurrentUser> => {
    if (this.currentUser) {
      return this.currentUser
    }

    const response = await this.tumblrClient.getCurrentUser()
    this.currentUser = mapUserInfo(response.json)
    return this.currentUser
  }

  login = async (creds?: LoginCreds): Promise<LoginResult> => {
    const cookieJar: CookieJar.Serialized = creds?.cookieJarJSON

    if (!TumblrClient.isLoggedIn(cookieJar)) {
      return { type: 'error' }
    }

    await this.tumblrClient.setLoginState(cookieJar)

    return {
      type: 'success',
    }
  }

  /**
   * `logout` logs out the user from the platform's servers,
   * session should no longer be valid. Called when user clicks logout.
   * */
  logout?: () => Awaitable<void>

  serializeSession = () => ({ cookies: this.tumblrClient.cookieJar.toJSON() })

  searchUsers?: (typed: string) => Awaitable<User[]>

  searchThreads?: (typed: string) => Awaitable<Thread[]>

  searchMessages?: (typed: string, pagination?: PaginationArg, options?: SearchMessageOptions) => Awaitable<Paginated<Message>>

  getPresence?: () => Awaitable<PresenceMap>

  getCustomEmojis?: () => Awaitable<CustomEmojiMap>

  getThreads: (folderName: ThreadFolderName, pagination?: PaginationArg) => Awaitable<Paginated<Thread>>

  /** Messages should be sorted by timestamp asc → desc */
  getMessages: (threadID: ThreadID, pagination?: PaginationArg) => Awaitable<Paginated<Message>>

  getThreadParticipants?: (threadID: ThreadID, pagination?: PaginationArg) => Awaitable<Paginated<Participant>>

  getStickerPacks?: (pagination?: PaginationArg) => Awaitable<Paginated<StickerPack>>

  getStickers?: (stickerPackID: StickerPackID, pagination?: PaginationArg) => Awaitable<Paginated<Attachment>>

  getThread?: (threadID: ThreadID) => Awaitable<Thread | undefined>

  getMessage?: (threadID: ThreadID, messageID: MessageID) => Awaitable<Message | undefined>

  getUser?: (ids: | { userID: UserID } | { username: string } | { phoneNumber: PhoneNumber } | { email: string }) => Awaitable<User | undefined>

  createThread?: (userIDs: UserID[], title?: string, messageText?: string) => Awaitable<boolean | Thread>

  updateThread?: (threadID: ThreadID, updates: Partial<Thread>) => Awaitable<void>

  deleteThread?: (threadID: ThreadID) => Awaitable<void>

  reportThread?: (type: 'spam', threadID: ThreadID, firstMessageID?: MessageID) => Awaitable<boolean>

  sendMessage?: (threadID: ThreadID, content: MessageContent, options?: MessageSendOptions) => Promise<boolean | Message[]>

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

  onThreadSelected?: (threadID: ThreadID) => Awaitable<void>

  loadDynamicMessage?: (message: Message) => Awaitable<Partial<Message>>

  registerForPushNotifications?: (type: keyof NotificationsInfo, token: string) => Awaitable<void>

  unregisterForPushNotifications?: (type: keyof NotificationsInfo, token: string) => Awaitable<void>

  getAsset?: (fetchOptions?: GetAssetOptions, ...args: string[]) => Awaitable<FetchURL | FetchInfo | Buffer | Readable | Asset>

  /** `getAssetInfo` must be implemented if getAsset supports fetchOptions.range */
  getAssetInfo?: (fetchOptions?: GetAssetOptions, ...args: string[]) => Awaitable<AssetInfo>

  /** `getOriginalObject` returns the JSON representation of the original thread or message */
  getOriginalObject?: (objName: 'thread' | 'message', objectID: ThreadID | MessageID) => Awaitable<string>

  handleDeepLink?: (link: string) => void

  /** reconnect any websocket, mqtt or network connections since client thinks it's likely to have broken */
  reconnectRealtime?: () => void
}

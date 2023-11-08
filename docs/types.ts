import { Blog } from 'types/blog';
import { Image, ImageResponse } from 'types/img';
import {
  BlockType,
  DisabledPost,
  FormattingType,
  GIFSearchAttribution,
  ImageBlock,
  Post,
} from 'types/posts';

import { APILinks } from './api-link';

/**
 * Creating the interfaces and enums for the responses that come from the messaging api
 * https://github.tumblr.net/Tumblr/specifications/blob/master/messaging/api-spec.md
 */

/** This is the representation of all of the conversations we're keeping track of in our app.
 * Key here is the selectedBlogUUID that corresponds to the inbox conversations.
 */
export interface MessagingData {
  [key: string]: InboxData;
}

export interface InboxData {
  conversations: Conversation[];
  links: APILinks;
}

export interface UnreadMessages {
  unreadMessagesCount: number;
  unreadMessagesByBlog: UnreadMessagesByBlog;
  unreadMessagesByBlogAndConversationId: UnreadMessagesByBlogAndConvo;
}

/** Note this is keyed on mentionKey not UUID */
export interface UnreadMessagesByBlog {
  [blogMentionKey: string]: number;
}

/** Note this is keyed on mentionKey not UUID */
export interface UnreadMessagesByBlogAndConvo {
  [blogMentionKey: string]: UnreadMessagesByBlogAndConvoByConversation | undefined; // count of unread messages
}

interface UnreadMessagesByBlogAndConvoByConversation {
  [conversationId: string]: number | undefined;
}

export interface SuggestedParticipants {
  suggestedParticipants: Blog[];
}

export interface UserInfo {
  blogs: Blog[];
  selectedBlog: Blog;
}

export interface ConversationWindowContext {
  retryMessage: (message: Message) => Promise<void>;
  deleteConversation: () => Promise<void>;
}

export interface SubmitNewMessageContent {
  text?: string;
  image?: ImageBlock;
}

/**
 * Information that's used to identify whom this conversation is with.
 */
export interface ConversationWindowObjectIdentifier {
  otherParticipantName: string;
  conversationId?: number | string;
}

/**
 * This is the conversation window object interface that we pass around the app.
 * With only a few exceptions (when creating new conversations), all instances of
 * this object _should_ have a conversationId.
 */
export interface ConversationWindowObject extends ConversationWindowObjectIdentifier {
  selectedBlogName: string | undefined;
  avatar?: ImageResponse;
  lastOpenedDateTs?: number;
  messageText?: string;
  messageImage?: ImageBlock;
}

/**
 * When conversations moves states, we need to know what its last action was so that we can
 * properly transition around that.
 */
export interface ConversationWindowObjectWithTransitionInfo extends ConversationWindowObject {
  action: ConversationAction;
}

/**
 * These are the actions that can be taken by a conversation. It's helpful to know these
 * both to route code paths around, as well as to determine animations (and other future
 * use cases).
 *
 *   - 'opened': Conversation that wasn't open in any other UI element prior, being opened now
 *   - 'closed': Conversation is going away from visible UI elements
 *   - 'minimized': Conversation moved into the minimized chathead state
 *   - 'maximized': Conversation moved from minimized chathead state to opened state
 */
export type ConversationAction = 'opened' | 'closed' | 'minimized' | 'maximized';

export interface BaseConversationInfo {
  selectedBlog: Blog;
  otherParticipant: Blog;
  token: string;
}

export interface ConversationInfo extends BaseConversationInfo {
  conversation: Conversation;
}

// Due to the way we have our routes set up, there are times when we want our prefetch
// to add a lil' something extra.
export interface PrefetchConversationInfo extends ConversationInfo {
  blogName: string | undefined;
}

export interface Conversation {
  objectType: ObjectType;
  id: number | string;
  status: ConversationStatus;
  lastModifiedTs: number;
  lastReadTs: number;
  unreadMessagesCount: number;
  canSend: boolean;
  isPossibleSpam: boolean;
  isBlurredImages: boolean;
  participants: Blog[];
  messages: MessagesObject;
}

interface MessagesObject {
  data: Message[];
  links?: APILinks;
}

export interface GIFPost extends Partial<Post> {
  type: BlockType.Image;
  content: ImageBlock[];
}

export interface Message {
  type: MessageType;
  participant: string; // matches to Blog.uuid
  ts?: string;
  unread?: boolean;
  content?: TextContent;
  post?: Post | DisabledPost | GIFPost;
  images?: MessageImage[];
  pendingTs?: string;
  canRetry?: boolean;
  isPending?: boolean;
  isRetrying?: boolean;
  /** This message was unable to be sent and cannot explictly be retried */
  couldNotSend?: boolean;
  stickerId?: string;
}

export interface OutboundMessage extends Message {
  attribution?: GIFSearchAttribution; // Used for sending GIFs
  context?: MessagingContext;
  imageFile?: File;
  postToShare?: OutboundMessagePost;
}

export interface OutboundMessageWithImage extends OutboundMessage {
  imageFile: File;
}

// At this time, the batch send endpoint can only support text and post batch send
// But if that changes, we just have to enable those allowed types here:
export interface BatchSendOutboundMessage extends OutboundMessage {
  type: MessageType.Text | MessageType.Post;
}

// When sharing post messages, we only need reference to the blog UUID and the timeline object ID
interface OutboundMessagePost {
  blog: string; // Blog's UUID
  id: string | number;
}

export interface TextContent {
  text: string;
  formatting?: TextFormattingRange[];
}

interface TextFormattingRange {
  type: FormattingType;
  position: { [index: number]: number };
}

interface MessageImage {
  altSizes: Image[];
  originalSize: Image;
}

export interface LinkFormatType extends TextFormattingRange {
  type: FormattingType.Link;
  attributes: {
    url: string;
    blogName?: string;
    postId?: string;
    messagingBlogName?: string;
  };
}

export enum MessageType { // eslint-disable-line no-restricted-syntax
  Text = 'TEXT',
  Image = 'IMAGE',
  Sticker = 'STICKER',
  Post = 'POSTREF',
}

enum ConversationStatus { // eslint-disable-line no-restricted-syntax
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
}

enum ObjectType { // eslint-disable-line no-restricted-syntax
  Conversation = 'conversation',
  Message = 'message',
}

export enum MessagingContext { // eslint-disable-line no-restricted-syntax
  GIF = 'messaging-gif',
  POST_CHROME = 'post-chrome',
  FAST_POST_CHROME = 'fast-post-chrome',
}

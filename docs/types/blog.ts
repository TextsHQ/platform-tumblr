import { TimeZones } from 'routes/main/blog-settings/timezone';
import { AvatarShape } from 'types/avatar';
import type { DomainStatus } from 'types/domains';
import { ImageResponse } from 'types/img';
import { PaywallAccess, SubscriptionPlan } from 'types/memberships';
import { Block, Post } from 'types/posts';
import { Order, TumblrmartAccessories } from 'types/tumblrmart';

export interface BlogTheme {
  avatarShape: AvatarShape;
  backgroundColor: string;
  bodyFont: string;
  headerBounds?: string | number;
  headerFullHeight?: number;
  headerFullWidth?: number;
  headerImage: string;
  headerImageFocused?: string;
  headerImageScaled?: string;
  headerStretch?: boolean;
  linkColor: string;
  showAvatar: boolean;
  showDescription: boolean;
  showHeaderImage: boolean;
  showTitle: boolean;
  titleColor: string;
  titleFont: string;
  titleFontWeight: string;
}

// Note: this is here to ensure that if there is a key in the BlogQueryParams enum, that it has
// a corresponding attribute in the Blog interface. This is a unidirectional check, however,
// which means that Blog _may_ have items that are not fetchable from optional query params.
type KeysMissingFromInterface = Exclude<BlogQueryParams, keyof Blog>;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type VerifyInterfaceAndEnum<Missing extends never = KeysMissingFromInterface, x = never> = 0;

// ts-unused-exports:disable-next-line
export const ____do_not_use: VerifyInterfaceAndEnum = 0;

export const MAX_BLOG_NAME_LENGTH = 32;
export const MAX_ASK_PAGE_TITLE_LENGTH = 26;

/**
 * Query params for blog fields
 * Notes:
 * - 'topTagsFewer': This is very similar to topTags, but it returns fewer results
 *   and has some additional processing that makes it look good in the blog card UI
 * - 'topTagsAll': This is also very similar to topTags, but it returns way more results
 */
export type BlogQueryParams =
  | 'admin'
  | 'advertiserName'
  | 'allowSearchIndexing'
  | 'analyticsUrl'
  | 'ask'
  | 'askAnon'
  | 'askPageTitle'
  | 'asksAllowMedia'
  | 'avatar'
  | 'badge'
  | 'badgeText'
  | 'blogViewUrl'
  | 'canAddTipMessage'
  | 'canBeFollowed'
  | 'canMessage'
  | 'canOnboardToPaywall'
  | 'canOnboardToTipping'
  | 'canShowTip'
  | 'canSubmit'
  | 'canSubscribe'
  | 'description'
  | 'descriptionNpf'
  | 'drafts'
  | 'durationBlogFollowingYou'
  | 'durationFollowingBlog'
  | 'firstPostTimestamp'
  | 'followed'
  | 'followers'
  | 'hasFlaggedPosts'
  | 'isActive'
  | 'isAdult'
  | 'isBrandSafe'
  | 'isBlockedFromPrimary'
  | 'isBloglessAdvertiser'
  | 'isFollowingYou'
  | 'isGroupChannel'
  | 'isHiddenFromBlogNetwork'
  | 'isMember'
  | 'isNsfw'
  | 'isOptoutAds'
  | 'isPasswordProtected'
  | 'isPaywallOn'
  | 'isPremiumPartner'
  | 'isPrivateChannel'
  | 'isTippingOn'
  | 'isTumblrpayOnboarded'
  | 'language'
  | 'mentionKey'
  | 'messages'
  | 'name'
  | 'notifications'
  | 'paywallAccess'
  | 'posts'
  | 'primary'
  | 'queue'
  | 'replyConditions'
  | 'secondsSinceLastActivity'
  | 'shareFollowing'
  | 'shareLikes'
  | 'showAuthorAvatar'
  | 'showTopPosts'
  | 'shouldShowTip'
  | 'shouldShowGift'
  | 'shouldShowTumblrmartGift'
  | 'subscribed'
  | 'subscriptionPlan'
  | 'theme'
  | 'timezone'
  | 'timezoneOffset'
  | 'title'
  | 'topTags'
  | 'topTagsAll'
  | 'topTagsFewer'
  | 'updated'
  | 'url'
  | 'uuid'
  | 'wasPaywallOn'
  | 'supportsReplies'
  | 'tippingPostsDefault'
  | 'tumblrmartOrders'
  | 'tumblrmartAccessories'
  | 'created'
  | 'liveNow'
  | 'liveStreamingUserId'
  | 'showBadgeManagement'
  | 'canShowBadges';

export interface BaseBlog {
  name: string;
  title?: string;
  url: string;
  uuid?: string;
}

export interface Blog extends BaseBlog {
  active?:
    boolean; /** https://jira.tumblr.net/browse/PW-1591 A weird one, that currently is only used within the dashboard timeline's trail's blog object. You should usually be checking `isActive` instead.*/
  admin?: boolean;
  advertiserName?: string;
  allowSearchIndexing?: boolean;
  analyticsUrl?: string;
  ask?: boolean;
  askAnon?: boolean;
  askPageTitle?: string;
  asksAllowMedia?: BlogSettings['asksAllowMedia'];
  avatar?: ImageResponse;
  badge?: string;
  badgeText?: string;
  blogViewUrl?: string;
  canAddTipMessage?: boolean;
  canBeFollowed?: boolean;
  canMessage?: boolean;
  canOnboardToPaywall?: boolean;
  canOnboardToTipping?: boolean;
  canShowTip?: boolean;
  canSubmit?: boolean;
  canSubscribe?: boolean;
  created?: number;
  description?: string;
  descriptionNpf?: Block[];
  drafts?: number;
  durationBlogFollowingYou?: number;
  durationFollowingBlog?: number;
  firstPostTimestamp?: number;
  followed?: boolean;
  followers?: number;
  hasFlaggedPosts?: boolean;
  isActive?: boolean;
  isAdult?: boolean;
  isBlockedFromPrimary?: boolean;
  isBloglessAdvertiser?: boolean;
  isBrandSafe?: boolean;
  isFollowingYou?: boolean;
  isGroupChannel?: boolean;
  isHiddenFromBlogNetwork?:
    boolean; /** * Tipping related flags. Determines whether a blog level tip may have a tip message, tipping is enabled for the blog, * and the tip button should appear for the blog.*/
  isMember?: boolean;
  isNsfw?: boolean;
  isOptoutAds?: boolean;
  isPasswordProtected?: boolean;
  isPaywallOn?: boolean;
  isPremiumPartner?: boolean;
  isPrivateChannel?: boolean;
  isTippingOn?: boolean;
  isTumblrpayOnboarded?: boolean;
  language?: string;
  liveNow?: boolean;
  liveStreamingUserId?: string;
  mentionKey?: string;
  messages?: number;
  notifications?: Notifications;
  paywallAccess?: PaywallAccess;
  posts?: number;
  primary?: boolean; /** Whether this is the logged in user's primary blog or not. **/
  queue?: number;
  recommendationReason?: string;
  replyConditions?: '0' | '1' | '2' | '3';
  secondsSinceLastActivity?: number;
  shareFollowing?: boolean;
  shareLikes?: boolean;
  shouldShowGift?: boolean;
  shouldShowTip?: boolean;
  shouldShowTumblrmartGift?: boolean;
  showAuthorAvatar?: boolean;
  showTopPosts?: boolean;
  subscribed?: boolean;
  subscriptionPlan?: SubscriptionPlan;
  supportsReplies?: boolean;
  theme?: BlogTheme;
  timezone?: string;
  timezoneOffset?: string;
  tippingPostsDefault?: boolean;
  topTags?: { tag: string; count: number }[];
  topTagsAll?: {
    tag: string;
    count: number;
  }[]; /** * This is more-or-less topTags, but with more results from all time, rather than only recently used tags. */
  topTagsFewer?:
    string[]; /*** This is more-or-less topTags, but without count and there are fewer of them so the API response isn't bloated.* The API also has some special handling so that these look good in the UI (for example, tags longer than a certain length* will be filtered out server-side).*/
  tumblrmartAccessories?: TumblrmartAccessories;
  tumblrmartOrders?: Order[];
  updated?: number;
  wasPaywallOn?: boolean;
  showBadgeManagement?: boolean;
  canShowBadges?: boolean;
}

export enum Notifications { // eslint-disable-line no-restricted-syntax
  All = 'all',
  Following = 'following',
  None = 'none',
}

export type BlogWithValidSubscriptionPlan = Blog & { subscriptionPlan: SubscriptionPlan };
export function isBlogWithValidSubscriptionPlan(
  blog: Blog | BlogWithValidSubscriptionPlan,
): blog is BlogWithValidSubscriptionPlan {
  return !!blog.subscriptionPlan && blog.subscriptionPlan.isValid;
}

// The severely limited blog object that's used for @mention'ing blogs
export interface MentionBlog extends BaseBlog {
  avatarUrl: string;
}

// Sometimes blogs return full post objects for the `posts` field, instead of a posts count
export interface BlogWithPosts extends Omit<Blog, 'posts'> {
  posts: Post[];
}

export function blogWithPostsToBlog(blog: BlogWithPosts): Blog {
  return {
    ...blog,
    posts: undefined,
  };
}

export enum BlogHeaderSize { // eslint-disable-line no-restricted-syntax
  Big = 'big', // Desktop
  Medium = 'medium', // Mobile
  Small = 'small', // Blog card
  Mini = 'mini', // Mini blog card
}

export type InteractabilityBlaze = 'noone' | 'everyone';

export interface BlogSettings {
  affiliateLinks: boolean;
  allowSearchIndexing: boolean;
  askAllowAnonymous: boolean;
  hiddenFromBlogNetwork: boolean;
  hiddenFromSearchResults: boolean;
  askEnabled: boolean;
  askPageTitle: string;
  asksAllowMedia: boolean;
  avatar: ImageResponse;
  blogNetworkRedirect: boolean;
  cname: string;
  connectedDomainName?: string | null;
  connectedDomainStatus: DomainStatus;
  description: Blog['description'];
  // Discord settings only returned when lab experiment is enabled
  discordWebhookUrl?: string;
  discordSendNewOriginalPosts?: boolean;
  discordSendNewReblogs?: boolean;
  discordSendNewFollowers?: boolean;
  discordSendNewMembers?: boolean;
  discordSendReceivedAsks?: boolean;
  discordSendReceivedReblogs?: boolean;
  discordSendReceivedReplies?: boolean;
  discordSendReceivedLikes?: boolean;
  discordSendReceivedMentions?: boolean;
  emailNotificationsSettings: {
    askAnswer: boolean;
    newAsks?: boolean;
    newFollowers: boolean;
    newMentions?: boolean;
    newReplies?: boolean;
    newSubmissions?: boolean;
  };
  hasLegacyDomain?: boolean;
  isLegacyDomainTldSupported?: boolean;
  language: Blog['language'];
  messagingAllowFollowsOnly: boolean;
  name: Blog['name'];
  notifications: Notifications;
  restrictCrossdomainXml: boolean;
  shareFollowing: boolean;
  shareLikes: boolean;
  submissionsEnabled: boolean;
  submissionsAllowText: boolean;
  submissionsAllowPhoto: boolean;
  submissionsAllowQuote: boolean;
  submissionsAllowLink: boolean;
  submissionsAllowVideo: boolean;
  submissionsTitle: string;
  submissionsGuidelines: string;
  submissionsTags: string;
  theme: BlogTheme;
  timezone: keyof typeof TimeZones;
  title: Blog['title'];
  truncateRssFeed: boolean;
  interactabilityBlaze?: InteractabilityBlaze;
}

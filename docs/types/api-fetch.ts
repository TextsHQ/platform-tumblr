import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';

import { z } from 'zod';

import { CountsByBlog } from 'components/blog/post-count-manager';
import { AuthOption } from 'routes/main/settings/account/authentication-options';
import { SettingsState } from 'routes/main/settings/initial-state';
import { Blog, BlogSettings, BlogWithPosts, MentionBlog, Notifications } from 'types/blog';
import { HubsHeaderData } from 'types/hubs';
import { Image, ImageResponse } from 'types/img';
import {
  CreatorSettingRow,
  CreatorSettingRowWithCount,
  CreatorSettingRowWithIcon,
  CreatorSettingRowWithStatus,
  PricePoints,
  SubscriptionPlan,
} from 'types/memberships';
import { MrecWaterfallData } from 'types/monetization/redpop-mrec';
import { Payout, PayoutBalance } from 'types/payouts';
import { PostActivityResponseNotes, PostActivityResponseNotesTimeline } from 'types/post-activity';
import {
  AudioBlock,
  BaseTextBlock,
  Block,
  FormattingElement,
  PollChoice,
  Post,
  PostRole,
  PostSort,
  PostType,
  PostTypeForUI,
} from 'types/posts';
import { PremiumPricePoint, PremiumSubscriptionInfo, PremiumUserInfo } from 'types/premium';
import { PSA } from 'types/public-service-announcement';
import { Tab } from 'types/tab';
import {
  Ad,
  BlogViewFollowingTimelineObject,
  CarouselBlogElement,
  CarouselTagElement,
  CarouselTimeline,
  CarouselTimelineObject,
  PaywallSubscriptionInfo,
  SupporterSubscriptionInfo,
  Timeline,
  TimelineObject,
  UserSyncPixel,
} from 'types/timeline';
import { ParentTopic, TopicTag } from 'types/topics';
import { PaymentMethodType } from 'types/tumblr-pay';
import {
  Badge,
  BaseProduct,
  CarouselProduct,
  Gift,
  Order,
  ProductCategory,
  Purchase,
} from 'types/tumblrmart';
import { Video } from 'types/video';
import { VideoHubTimelineObject } from 'types/video-hub';
import { BLAZE_COMPLETED_CAMPAIGN_SCHEMA } from 'utils/api-helper/blaze';

import { ActivityStats } from './activity';
import { APILink, APILinks, QueryParamsApiLink } from './api-link';
import { CommunityLabelSetting } from './community-labels';
import { GifQueryParams, GifResponseData } from './gif-search';
import { UserConfigBase } from './initial-state';
import { ConfigRef } from './logging';
import { Conversation, InboxData, UnreadMessagesByBlogAndConvo } from './messaging';
import { BlazeActivePosts } from './monetization/blaze';
import { FollowedTag, SearchTag, ShortFormatedFollowedTag, TrendingTagTimelineObject } from './tag';
import { TippingAmount } from './tipping';
import User, { UserBlog } from './user';

import { makeApiFetchResponseSchema } from 'schemas/api-fetch';
import { API_LINKS_SCHEMA } from 'schemas/api-links';
import type { BlogFollowSource } from 'schemas/logging';
import { POST_TIMELINE_OBJECT_SCHEMA } from 'schemas/post';

export interface ApiFetches {
  readonly apiFetch: ApiFetch;
  readonly apiFetchWithSchema: ApiFetchWithSchema;
}

export interface ApiFetch {
  (givenPath: string, givenOptions?: ApiFetchOptions): Promise<any>;
}

export interface ApiFetchWithSchema {
  <
    Schema extends Zod.ZodTypeAny,
    Options extends ApiFetchWithSchemaOptions | undefined = undefined,
  >(
    givenPath: string,
    schema: Schema,
    givenOptions?: Options,
  ): Promise<Options extends { schemaParseMode: 'report' } ? unknown : Zod.infer<Schema>>;
}

type Headers = Record<string, string>;

export interface ApiFetchOptions extends RequestInit {
  queryParams?: Record<string, any>;
  apiToken?: string;
  baseUrl?: string;
  agent?: HttpAgent | HttpsAgent;
  /*
  Because body will be JSON.stringify()'ed in apiFetch, it's ok for it to be any instead of the
  inherited type from RequestInit.
  */
  body?: any;
  headers?: Headers;

  /**
   * Access the raw response
   *
   * This allows low-level access to the response. After some basic processing before more general
   * response handling, the callback, if provided, will be called with the fetch response.
   *
   * This will happen _before_ the promise resolves.
   *
   * If the promise is rejected, the callback may never be called.
   */
  responseCallback?: (response: Response) => void;

  /**
   * Ignore the response body
   *
   * Set to `true` if we're not interested in the response.
   * This can be helpful to e.g. ignore responses that are frequently mangled by ad blockers.
   */
  ignoreResponse?: boolean;
}

export interface ApiFetchWithSchemaOptions extends ApiFetchOptions {
  /**
   * Using a schema implies we're interested in the response.
   * This option should never be combined with a schema.
   */
  ignoreResponse?: never;

  /**
   * Schema parsing mode. This is useful for developing and testing schema behavior without
   * disrupting the application behavior.
   *
   * !!Warning!!: Do not use "report" with any schemas that include transformations! Report mode
   * only makes sense with "parse-only" schemas because it needs to fall-back to the raw response.
   *
   * Possible values:
   * - `'error'`: (default) reject with parse errors
   * - `'report'`: log errors and resolve with raw data in case of schema parse errors
   *
   * @default 'error'
   */
  schemaParseMode?: 'error' | 'report';

  /**
   * Print the full response in errors when responses fail to parse.
   *
   * This can be helpful for debugging schemas with problems, but can also be very noisy and produce very large logs.
   *
   * Use this judiciously. We recommend enabling it temporarily until an issue can be debugged.
   */
  schemaErrorPrintFullResponse?: boolean;
}

export interface NormalizedApiFetchOptions
  extends Omit<ApiFetchOptions, 'baseUrl' | 'queryParams'>
{}

interface Store {
  [key: string]: string | undefined;
}

export interface MakeApiFetchOptions {
  store: Store;
  baseUrl: string;
  httpAgent?: HttpAgent;
  httpsAgent?: HttpsAgent;
  extraHeaders?: Headers;
  extraQueryParams?: { [key: string]: string };
  responseInfoHandler?: (givenPath: string, responseInfo: ResponseInfo) => void;
  firstChanceErrorHandler?: (reason: unknown) => any;
  fetchFunction: (
    input: string,
    init?: NormalizedApiFetchOptions,
  ) => Promise<unknown>;
  /**
   * A function for handling errors we want to report but do not want to throw.
   */
  errorReporterFunction?: (err: Error) => void;
}

export interface ResponseInfo {
  latencyMs: number;
}

export interface ApiFetchResponse<T = Record<string, any>>
  extends z.infer<ReturnType<typeof makeApiFetchResponseSchema>>
{
  response: T;
}

export interface SuggestedParticipantsResponse extends ApiFetchResponse {
  response: {
    blogs: Blog[];
  };
}

export interface SuggestedParticipantsQueryParams {
  q?: string;
  limit?: number;
  include_recent?: boolean;
}

export interface InboxDataResponse extends ApiFetchResponse {
  response: InboxData;
}

export interface MrecWaterfallResponse extends ApiFetchResponse {
  response: MrecWaterfallData;
}

export type BlogResponse = ApiFetchResponse<{
  blog: Blog;
}>;

export type TopicListResponse = ApiFetchResponse<{
  requiredCount: number;
  setType: string;
  subtitle: string;
  title: string;
  topics: ParentTopic[];
  followedTags: string[];
}>;

export type SuggestedTagsResponse = ApiFetchResponse<{
  sections: {
    sectionTitle: string;
    tags: TopicTag[];
  }[];
}>;

export type SearchTopicTagsResponse = ApiFetchResponse<TopicTag[]>;

export interface ConversationResponse extends ApiFetchResponse {
  response: Conversation & { token: string };
}

export interface ConversationBatchResponse extends ApiFetchResponse {
  response: { [key: string]: Conversation };
}

export interface UserResponse extends ApiFetchResponse {
  response: {
    user: User;
  };
}

interface GroupedBlogAction {
  type: string;
  href: string;
  method: string;
  bodyParams?: { context: string; ids: string; tag: string };
}

export interface GroupedBlog {
  name: string;
  action: GroupedBlogAction;
  blogs: BlogWithPosts[];
  heading: string;
  highlight: string | null;
  subheading: string | null;
}

export type RecommendedBlogListResponse = {
  requiredCount: number;
  sections: GroupedBlog[];
  subtitle: string;
  title: string;
  followedBlogs: { name: string; url: string }[];
};

export type RecommendedBlogListApiResponse = ApiFetchResponse<RecommendedBlogListResponse>;

export interface IntentSurveyOption {
  id: string;
  title: string;
  isSelected: boolean;
}

export type IntentSurveyResponse = ApiFetchResponse<{
  title: string;
  description: string;
  options: Array<IntentSurveyOption>;
}>;

export enum UserCountsQueryParams { // eslint-disable-line no-restricted-syntax
  inbox = 'inbox',
  notifications = 'notifications',
  unread = 'unread',
  unreadMessages = 'unread_messages',
  nextFrom = 'next_from',
  blogNotificationCounts = 'blog_notification_counts',
  privateGroupBlogUnreadPostCounts = 'private_group_blog_unread_post_counts',
  blogPostCounts = 'blog_post_counts',
  legacyInboxUnread = 'legacy_inbox_unread',
  legacyInboxUnreadStatus = 'legacy_inbox_unread_status',
}

// snake_case object keys that match query params
export type UserCountsResponseRaw =
  & Partial<
    Record<
      UserCountsQueryParams,
      | number
      | UnreadMessagesByBlogAndConvo
      | UserNotification[]
      | CountsByBlog
      | { blog_uuid: string; count: number }[]
      | PrivateGroupBlogUnreadNotifications
      | LegacyInboxUnread
    >
  >
  & // is in the response, but is instead at the same level as response // This API endpoint appears to have been configured incorrectly. None of the requested data
  { response: {} };

export interface UserCountsResponseData {
  unread: number;
  unreadMessages: UnreadMessagesByBlogAndConvo;
  nextFrom: number;
  notifications: UserNotification[];
  blogPostCounts: CountsByBlog;
  blogNotificationCounts: UserBlogNotification[];
  privateGroupBlogUnreadPostCounts: PrivateGroupBlogUnreadNotifications;
  legacyInboxUnread: LegacyInboxUnread;
  inbox: number;
}

export interface PrivateGroupBlogUnreadNotifications {
  [blogUuid: string]: number | string | undefined;
}

interface LegacyInboxUnread {
  [blogUuid: string]: boolean;
}

export interface UserBlogNotification {
  blogUuid: string;
  count: number;
}

export interface FilterType {
  postType?: PostTypeForUI;
  postRole?: PostRole;
  postSort: PostSort;
}

interface UserNotification {
  hash: string;
  timestamp: number;
}

export interface GifResponse extends ApiFetchResponse {
  response: GifResponseData;
}

export interface FetchedImageResponse extends ApiFetchResponse {
  response: Image;
}

export interface FetchedVideoResponse extends ApiFetchResponse {
  response: Video;
}

export interface FetchedAudioResponse extends ApiFetchResponse {
  response: AudioBlock;
}

export interface NotesResponse extends ApiFetchResponse {
  response: PostActivityResponseNotes;
}

export interface NotesTimelineResponse extends ApiFetchResponse {
  response: PostActivityResponseNotesTimeline;
}

// @TODO Replace with inferred URL_INFO_RESPONSE_SCHEMA type when blocks are complete
export type UrlInfoResponse = ApiFetchResponse<{ content: Block }>;

export type ImageInfoResponse = ApiFetchResponse<{
  path: string;
  requestedImage: string;
  image: ImageResponse;
  post?: Post;
  imageIsPaywalled?: boolean;
}>;

export interface MentionsResponse extends ApiFetchResponse {
  response: {
    blogs: MentionBlog[];
  };
}

export type PostsResponse = ApiFetchResponse<{
  posts: Post[];
  blog: Blog;
  links?: APILinks;
}>;

export interface PostResponse extends ApiFetchResponse {
  response: Post;
}

export const isPostsResponse = (
  response: ApiFetchResponse<any>,
): response is PostsResponse => !!response.response.posts;

export interface GetPostsQueryParams {
  context?: 'archive';
  postType?: PostType | PostTypeForUI;
  beforeDate?: {
    year: number;
    month: number;
  };
  tag?: string;
  beforeId?: string;
  offset?: number;
}

export interface SearchPostsQueryParams {
  next_offset?: number;
}

export interface PostReplyResponse extends ApiFetchResponse {
  response: {
    content: BaseTextBlock[];
    timestamp: number;
    isSubscribed: boolean;
    formatting: FormattingElement[];
  };
}

export interface VotePollResponse extends ApiFetchResponse {
  response: {
    pollId: string;
    selected: number[];
    choices: PollChoice[];
  };
}

export type DashboardApiResponse = ApiFetchResponse<{
  timeline: Timeline;
  adsUserSync?: { pixels: UserSyncPixel[] };
}>;

export type TimelineApiResponse = ApiFetchResponse<{
  timeline: Timeline;
}>;

export const isDashboardResponse = (
  response: ApiFetchResponse<any>,
): response is DashboardApiResponse => !!response.response.timeline;

export type TabsApiResponse = ApiFetchResponse<{
  tabs: Tab[];
}>;

export type RelatedPostsApiResponse = ApiFetchResponse<{
  elements: Post[];
}>;

export interface FollowingApiResponse extends ApiFetchResponse {
  response: {
    totalBlogs: number;
    blogs: Blog[];
    links?: {
      next?: QueryParamsApiLink;
      prev?: QueryParamsApiLink;
    };
  };
}

export interface BlogFollowingApiResponse extends ApiFetchResponse {
  response: {
    totalBlogs: number;
    blogs: TimelineObject[];
    links?: {
      next?: QueryParamsApiLink;
      prev?: QueryParamsApiLink;
    };
  };
}

export interface FollowersApiResponse extends ApiFetchResponse {
  response: {
    totalUsers: number;
    users: UserBlog[];
    links?: {
      next?: QueryParamsApiLink;
      prev?: QueryParamsApiLink;
    };
  };
}

export interface FollowRequestParams {
  placementId?: string;
  source?: BlogFollowSource;
  earnedId?: string;
  registrationSource?: string;
  tag?: string;
}

export interface FollowApiResponse extends ApiFetchResponse {
  response: {
    blog: Blog;
    status: FollowStatus;
  };
}

export enum FollowStatus { // eslint-disable-line no-restricted-syntax
  Followed = 'followed',
  Own = 'own',
  Exists = 'exists',
}

export interface FollowedByApiResponse extends ApiFetchResponse {
  response: {
    followedBy: boolean;
  };
}

export interface QueueApiResponse extends ApiFetchResponse {
  response: {
    posts: TimelineObject[];
    links?: APILinks;
  };
}

export interface QueueSettingsApiResponse extends ApiFetchResponse {
  response: {
    postFrequency: number;
    startHour: number;
    endHour: number;
  };
}

export interface QueuePlusSettingsApiResponse extends ApiFetchResponse {
  response: {
    version: number;
    interval: number;
    perInterval: number;
    startTime: string;
    endTime: string;
  };
}

export interface BlogSubmissionApiResponse extends ApiFetchResponse {
  response: {
    posts: TimelineObject[];
    links?: APILinks;
  };
}

export interface InboxSubmissionApiResponse extends ApiFetchResponse {
  response: {
    posts: TimelineObject[];
    links?: {
      next?: QueryParamsApiLink;
      prev?: QueryParamsApiLink;
    };
  };
}

export interface DraftsApiResponse extends ApiFetchResponse {
  response: {
    posts: TimelineObject[];
    links?: APILinks;
  };
}

export interface DraftsQueryParams {
  /** We'd prefer this to be camelCase, but it's a queryParam and it'd likely be even MORE confusing to be converting it around all the time */
  before_id?: string | number;
}

export interface ReviewApiResponse extends ApiFetchResponse {
  response: {
    timeline: {
      elements: TimelineObject[];
    };
    links?: APILinks;
  };
}

export interface LimitsApiResponse extends ApiFetchResponse {
  response: {
    video: {
      maxByteSize: number;
      maxSize: string;
    };
  };
}

export type PremiumSubscriptionApiResponse = ApiFetchResponse<PremiumSubscriptionInfo>;

export type PremiumPricePointsApiResponse = ApiFetchResponse<PremiumPricePointsApiResponseData>;

interface PremiumPricePointsApiResponseData {
  premiumPricePoints: PremiumPricePoint[];
}

export type PremiumCheckoutUrlResponse = ApiFetchResponse<{
  url: string;
}>;

export type PremiumRewardedAdInfoResponse = ApiFetchResponse<{
  user: PremiumUserInfo;
  rewardedAd: Ad | null;
}>;

export type PremiumRewardedAdStartAdResponse = ApiFetchResponse<{
  token: string;
}>;

export type PremiumRewardedAdFinishAdResponse = ApiFetchResponse<{
  newExpiration: number;
}>;

export type UserConfigResponse = ApiFetchResponse<
  UserConfigBase & {
    configuration: ConfigRef;
    redpop: UserConfigRedpopInfo;
  }
>;

export type GdprConfig = Partial<{
  gdprGvlVersion: string;
  gdprGvlEncodedVendors: string;
  gdprGvlEncodedInterests: string;
  gdprGvlEncodedNonIabVendors: string;
  gdprIsEu: boolean;
  gdprConsentMaxAgeDays: number;
  gdprHasAnalyticsConsent: boolean;
  gdprGvlPath: string;
  translations: Record<string, string>;
}>;

export interface UserConfigRedpopInfo extends GdprConfig {
  isLoggedIn: boolean;
  isPartiallyRegistered?: boolean;
  isSuspended?: boolean;
  isCompromised?: boolean;
  isAdmin?: boolean;
  olderThanMinimumCcpaAge?: boolean;
  language?: string;
  tumblrAdId?: string;
  automatticId?: string;
  endlessScrollingDisabled?: boolean;
  bestStuffFirstDisabled?: boolean;
  colorizedTags?: boolean;
  autoTruncatingPosts?: boolean;
  timestamps?: boolean;
  communityLabelVisibilitySetting?: CommunityLabelSetting;
  labsSettings?: Record<string, boolean | undefined>;
}

export interface SearchResponse extends ApiFetchResponse {
  response: {
    blogs?: Blog[];
    tags?: SearchTag[];
    requestId: string;
  };
}

export interface SearchTagsResponse extends ApiFetchResponse {
  response: {
    typeahead?: SearchTag[];
  };
}

export interface AudioTrack {
  id: string;
  description: {
    primary: string;
    secondary: string;
    info: string;
  };
  href: string;
  images: {
    thumbnail: string;
  };
  provider: {
    name: string;
    icon: string;
  };
}

export interface SearchAudioResponse extends ApiFetchResponse {
  response: {
    tracks: AudioTrack[];
  };
}

export interface RadarResponse extends ApiFetchResponse {
  response: {
    posts: Post[];
    links?: LinksNext<GifQueryParams>;
  };
}

export interface DismissResponse extends ApiFetchResponse {
  response: {
    message: string;
  };
}

export type LikesApiResponse = ApiFetchResponse<LikesApiResponseData>;

export interface LikesApiResponseData {
  likedPosts: TimelineObject[];
  likedCount: number;
  links?: APILinks;
}

export interface LikesQueryParams {
  limit?: number;
  before?: number | string;
  after?: number | string;
}

export interface UpdateBlogSettingsParams
  extends Partial<BlogSettings['emailNotificationsSettings']>
{
  cname?: BlogSettings['cname'];
  isPaywallOn?: boolean;
  name?: Blog['name'];
  askAnswer?: boolean;
  askEnabled?: boolean;
  newAsks?: boolean;
  newFollowers?: boolean;
  newMentions?: boolean;
  newReplies?: boolean;
  newSubmissions?: boolean;
  notifications?: Notifications;
  replyConditions?: Blog['replyConditions'];
}

// TODO [PW-121]: Unify this with the paradigm in `APILinks`
export interface LinksNext<Q> {
  next?: {
    href: string;
    method: string;
    queryParams?: Q;
  };
}

export interface RelatedTagsResponse {
  response: { [searchedTag: string]: string[] };
}

export type FollowingTagResponse = ApiFetchResponse<{
  following?: boolean;
}>;

export type RecommendedBlogsResponse = ApiFetchResponse<{
  blogs: Blog[];
  links?: APILinks;
}>;

export type RecommendedBlogsWithTagResponse = ApiFetchResponse<{
  blogs: {
    data: Blog[];
    links?: APILinks;
  };
  psa?: PSA;
}>;

export interface HubsHeaderResponse {
  response: {
    header: HubsHeaderData;
  };
}

export type RecommendedBlogsCarouselResponse = ApiFetchResponse<{
  timeline: CarouselTimeline;
}>;

export type RelatedBlogsResponse = ApiFetchResponse<{
  timeline: CarouselTimeline;
}>;

export interface ExploreApiResponse {
  response: {
    timeline?: Timeline;
    links?: APILinks;
  };
}

export type BlogsTimelineResponse = ApiFetchResponse<{
  timeline: BlogsTimeline;
}>;

export interface BlogsTimeline {
  elements: CarouselBlogElement[];
  links: APILinks;
}

export type FollowedTagsTimelineResponse = ApiFetchResponse<{
  timeline: FollowedTagsTimeline;
}>;

export type ShortFollowedTagsResponse = ApiFetchResponse<{
  elements: ShortFormatedFollowedTag[];
  links?: APILinks;
}>;

export interface FollowedTagsTimeline {
  elements: FollowedTag[];
  links?: APILinks;
}

export type TrendingTagsTimelineResponse = ApiFetchResponse<{
  timeline: TrendingTagsTimeline;
}>;

export type TagsSuggestionsResponse = ApiFetchResponse<{
  blogTags: SearchTag[];
  similar: SearchTag[];
  typeahead: SearchTag[];
  links?: APILinks;
}>;

export type BlogTagsSuggestionsResponse = ApiFetchResponse<{
  tags: string[];
}>;

export interface TrendingTagsTimeline {
  elements: TrendingTagTimelineObject[];
}

export type RecommendedTagsTimelineResponse = ApiFetchResponse<{
  timeline: RecommendedTagTimeline;
}>;

export type RecommendedTagTimeline = CarouselTimelineObject<CarouselTagElement>;

export type StaffPicksTagsTimelineResponse = ApiFetchResponse<{
  timeline: StaffPicksTagsTimeline;
}>;

export type StaffPicksTagsTimeline = CarouselTimelineObject<CarouselTagElement>;

export type MobileSearchApiResponse = ApiFetchResponse<
  MobileSearchApiResponseData & {
    psa?: PSA;
  }
>;

interface MobileSearchApiResponseData {
  posts: { data: TimelineObject[]; links: APILinks };
  blogs: { data: BlogWithPosts[]; links: APILinks };
}

interface TimelineSearchApiResponseData {
  timeline: Timeline;
}

export type TimelineSearchApiResponse = ApiFetchResponse<
  TimelineSearchApiResponseData & {
    psa?: PSA | null;
  }
>;

export interface ActivityStatsResponse extends ApiFetchResponse {
  response: ActivityStats;
}

export interface CrushesResponse extends ApiFetchResponse {
  response: {
    crushes: ReadonlyArray<Crush>;
  };
}

export interface Crush {
  blog: Blog;
  percentage: number; // Number is out of 100 (e.g., 40 for 40%)
}

export type MembershipSubscriptionPlanResponse = ApiFetchResponse<SubscriptionPlan>;
export type MembershipProvisionUrlResponse = ApiFetchResponse<{ url: string }>;
export type MemberPerksResponse = ApiFetchResponse<{ memberPerks: string[] }>;

export type PricePointsResponse = ApiFetchResponse<PricePoints>;
export type CreatorSettingsResponse = ApiFetchResponse<{
  creatorProfile: CreatorSettingRow;
  accountDetails: CreatorSettingRow;
  membershipPrice: CreatorSettingRowWithIcon;
  members: CreatorSettingRowWithCount;
  membershipsStatus: CreatorSettingRowWithStatus;
}>;

export type SupporterSubscribeResponse = ApiFetchResponse<{
  success: boolean;
  message: string;
}>;

export type MembershipsSusbcribeResponse = ApiFetchResponse<{
  ids: string[];
  message: string;
}>;

export type GenerateCheckoutUrlResponse = ApiFetchResponse<{
  url: string;
}>;

export type GiftResponse = ApiFetchResponse<Gift>;

export type StorefrontV2Response = ApiFetchResponse<{
  categories: ProductCategory[];
  carousel: CarouselProduct[];
  list: BaseProduct[];
}>;

export type ReceivedOrdersResponse = ApiFetchResponse<{
  hasNextPage: boolean;
  nextBeforeCreationTs: number;
  orders: Gift[];
  links?: APILinks;
}>;

export type OrderResponse = ApiFetchResponse<Order>;

export type BadgesResponse = ApiFetchResponse<{
  active: Badge[];
  available: Badge[];
}>;

export type AskIdResponse = ApiFetchResponse<Gift>;

export type MembershipSubscribersResponse = ApiFetchResponse<{
  timeline: SubscribersTimeline;
}>;

export type PayoutsListResponse = ApiFetchResponse<{
  payouts: Payout[];
}>;

export type PayoutsBalanceResponse = ApiFetchResponse<{
  balance: PayoutBalance;
  stripeDashboardUrl: string;
}>;

export type PaymentMethodResponse = ApiFetchResponse<{
  cardNetwork?: string;
  expiryYear?: number;
  expiryMonth?: number;
  lastFour?: string;
  links: { updatePaymentMethodUrl: APILink };
  type?: PaymentMethodType;
}>;

export type PurchasesResponse = ApiFetchResponse<{
  orders: Purchase[];
  links?: APILinks;
}>;

interface SubscribersTimeline {
  elements: TimelineObject[];
  links?: APILinks;
}

export type TumblrmartSubscriptionsResponse = ApiFetchResponse<{
  timeline: SubscriptionsTimeline;
}>;
interface SubscriptionsTimeline {
  elements: (PaywallSubscriptionInfo | SupporterSubscriptionInfo)[];
  links?: APILinks;
  count: number;
}

export interface BirthdayDetailsResponse extends ApiFetchResponse {
  response: {
    age: number;
    born: number;
    birthDate: string;
  };
}

export interface ThirdPartyAuthDetailsResponse extends ApiFetchResponse {
  response: {
    email: string;
    thirdPartyAuthProviders: AuthOption[];
  };
}

export type SettingsResponse = ApiFetchResponse<SettingsState>;

interface TimelineVideoHubApiResponseData {
  timeline: Timeline;
  hub: VideoHubTimelineObject;
}

export type TimelineVideoHubApiResponse = ApiFetchResponse<TimelineVideoHubApiResponseData>;

interface TimelineVideoHubsApiResponseData {
  timeline: Timeline;
}

export type TimelineVideoHubsApiResponse = ApiFetchResponse<TimelineVideoHubsApiResponseData>;

export interface TippingAmountsResponse extends ApiFetchResponse {
  response: {
    tipPricePoints: TippingAmount[];
    tipPriceLimits: { minCents: number; maxCents: number };
    dailyTipAmountRemainingCents: number;
  };
}

export interface ValueWithHeaders<T> {
  value: T;
  headersReceived: globalThis.Headers[];
}

export interface RecentlyFollowedApiResponse extends ApiFetchResponse {
  response: {
    totalBlogs: number;
    blogs: BlogViewFollowingTimelineObject[];
    links?: {
      next?: QueryParamsApiLink;
      prev?: QueryParamsApiLink;
    };
  };
}

export interface BlazeActivePostsResponse extends ApiFetchResponse {
  response: BlazeActivePosts;
}

export type BlazeCompletedCampaignResponse = z.infer<
  typeof BLAZE_COMPLETED_CAMPAIGN_SCHEMA
>;

export type DomainAutoRenewalUpdateResponse = ApiFetchResponse<{
  autoRenew: boolean;
}>;

export type DomainIsLockedUpdateResponse = ApiFetchResponse<{
  isLocked: boolean;
}>;

export type DomainSendAuthorizationCodeResponse = ApiFetchResponse<{
  email: string;
}>;

const ANSWER_TIME_TAKEOVER_SCHEMA = z.object({
  answerTime: z.object({
    accentColor: z.string().optional(),
    blogName: z.string().optional(),
    description: z.string().optional(),
    startDate: z.number().optional(),
    followed: z.boolean().optional(),
    liveClickthroughUrl: z.string().optional(),
  }).optional(),
  headerImage: z.string().optional(),
  live: z.boolean().optional(),
  completed: z.boolean().optional(),
});

export const ANSWER_TIME_RESPONSE_SCHEMA = z.object({
  timeline: z.object({
    elements: z.array(
      POST_TIMELINE_OBJECT_SCHEMA.merge(z.object({ id: z.string() })),
    ),
    links: API_LINKS_SCHEMA.optional(),
  }),
  // Takeover is optional as it's only included in the first page of results
  takeover: ANSWER_TIME_TAKEOVER_SCHEMA.optional(),
});

const ANSWER_TIME_API_RESPONSE_SCHEMA = z.object({
  response: ANSWER_TIME_RESPONSE_SCHEMA,
});

export type AnswerTimeTakeover = z.infer<typeof ANSWER_TIME_TAKEOVER_SCHEMA>;
export type AnswerTimeResponse = z.infer<typeof ANSWER_TIME_RESPONSE_SCHEMA>;
export type AnswerTimeApiResponse = z.infer<typeof ANSWER_TIME_API_RESPONSE_SCHEMA>;

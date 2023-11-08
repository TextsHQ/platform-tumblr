import { generateSettingsPath } from 'paths/main';
import { SettingsState } from 'routes/main/settings/initial-state';
import { ActivityStatsGranularity, ActivityStatsGraph, ActivityStatsRange } from 'types/activity';
import {
  ActivityStatsResponse,
  ApiFetch,
  ApiFetchResponse,
  BlogResponse,
  BlogSubmissionApiResponse,
  BlogTagsSuggestionsResponse,
  ConversationBatchResponse,
  ConversationResponse,
  CreatorSettingsResponse as CreatorSettingsStatusResponse,
  DashboardApiResponse,
  DraftsApiResponse,
  DraftsQueryParams,
  FetchedAudioResponse,
  FetchedImageResponse,
  FetchedVideoResponse,
  FollowApiResponse,
  FollowedByApiResponse,
  FollowersApiResponse,
  FollowingApiResponse,
  FollowRequestParams,
  GenerateCheckoutUrlResponse,
  HubsHeaderResponse,
  ImageInfoResponse,
  InboxDataResponse,
  InboxSubmissionApiResponse,
  LikesApiResponse,
  LikesQueryParams,
  LimitsApiResponse,
  MemberPerksResponse,
  MembershipProvisionUrlResponse,
  MembershipsSusbcribeResponse,
  MembershipSubscribersResponse,
  MembershipSubscriptionPlanResponse,
  MentionsResponse,
  MrecWaterfallResponse,
  NotesResponse,
  PaymentMethodResponse,
  PayoutsBalanceResponse,
  PayoutsListResponse,
  PostReplyResponse,
  PremiumCheckoutUrlResponse,
  PremiumPricePointsApiResponse,
  PremiumRewardedAdFinishAdResponse,
  PremiumRewardedAdInfoResponse,
  PremiumRewardedAdStartAdResponse,
  PremiumSubscriptionApiResponse,
  PricePointsResponse,
  RadarResponse,
  RelatedBlogsResponse,
  RelatedPostsApiResponse,
  ReviewApiResponse,
  SettingsResponse,
  SuggestedParticipantsQueryParams,
  SuggestedParticipantsResponse,
  SupporterSubscribeResponse,
  TabsApiResponse,
  TumblrmartSubscriptionsResponse,
  UpdateBlogSettingsParams,
  UserConfigResponse,
  UserCountsQueryParams,
  UserCountsResponseRaw,
  VotePollResponse,
} from 'types/api-fetch';
import { Blog } from 'types/blog';
import {
  CommunityLabelCategory,
  CommunityLabelCategoryValue,
  CommunityLabelPost,
} from 'types/community-labels';
import { GifQueryParams } from 'types/gif-search';
import { KrakenEvent, LogEvent } from 'types/logging';
import {
  BatchSendOutboundMessage,
  Conversation,
  ConversationWindowObject,
  OutboundMessage,
} from 'types/messaging';
import { PostActivityQueryParams } from 'types/post-activity';
import { AskLayout, LayoutType, NewOrEditablePost, PostState } from 'types/posts';
import { PromoteOptions } from 'types/promote';
import { SearchApiRequestMode } from 'types/search';
import { SettingsPageName } from 'types/settings';
import { SubscribersFilterMode } from 'types/subscribers';
import { SubscriptionsFilterMode } from 'types/subscriptions';
import { DashboardQueryParams } from 'types/timeline';
import { SubscriptionPeriod, SubscriptionsStatus, TumblrPayBaseRoute } from 'types/tumblr-pay';
import { snakeCase } from 'utils/ascii-word-case';
import {
  getBlogQueryParamsObject,
  getPostsQueryParamsThatRenderBlogCards,
  getTimelineBlogQueryParams,
} from 'utils/blog-query-params';
import { convertObjectToSnakeCase } from 'utils/convert-object-keys';
import ApiError from 'utils/errors/api';
import { filterProperties } from 'utils/filter-properties';
import getBlogNetworkDomain from 'utils/get-blog-network-domain';
import { groupBy } from 'utils/group-by';
import { isCategoryActive } from 'utils/posts/content-warnings';

import { ApiRequest, OnFulfilled } from './api-request';
import {
  getBatchSendMessageRequest,
  getMessagingQueryParams,
  getPathAndOptionsForSendMessage,
  messagingBlogQueryParams,
} from './messaging';
import { getFilterQueryParams } from './notification-filter';
import {
  AskRequestBody,
  FlagConversationType,
  PostRequestBody,
  ReblogType,
  SendMessageParticipants,
} from './types';

import type { ActivityFilterSet, ActivityNotificationResponse } from 'types/activity-notification';
import { HubsApiQuerySource } from 'types/hubs';

export const tumblrDotCom = '.tumblr.com';

export default function apiHelper(apiFetch: ApiFetch) { // eslint-disable-line import/no-default-export
  return {
    // eslint-disable-next-line no-restricted-syntax
    getConfig: (): ApiRequest<UserConfigResponse> => new ApiRequest(apiFetch, '/v2/config'),

    // eslint-disable-next-line no-restricted-syntax
    getBlogInfo: (blogName: string, queryParams: GifQueryParams = {}): ApiRequest<BlogResponse> =>
  new ApiRequest(apiFetch, `/v2/blog/${blogName}/info`, { queryParams }),

    // eslint-disable-next-line no-restricted-syntax
    getBlogTags: (blogName: string): ApiRequest<BlogTagsSuggestionsResponse> =>
  new ApiRequest(apiFetch, `/v2/blog/${blogName}/posts/tag_suggestions`),

    // eslint-disable-next-line no-restricted-syntax
    getSuggestedParticipants: (
    forBlogName: string = '',
    queryParams: SuggestedParticipantsQueryParams = {},
): ApiRequest<SuggestedParticipantsResponse> =>
  new ApiRequest(apiFetch, '/v2/conversations/participant_suggestions', {
    queryParams: {
      // Defaulting to using these since they're what's used whenever we actually want 'suggestedParticipants'
      ...getBlogQueryParamsObject([
        'avatar',
        'title',
        'name',
        'theme',
        'url',
        'blogViewUrl',
        'isAdult',
      ]),
      ...queryParams,
      ...(forBlogName?.length && { participant: getBlogNetworkDomain(forBlogName) }),
    },
  }),

    // eslint-disable-next-line no-restricted-syntax
    getDashboard: (queryParams: DashboardQueryParams = {}): ApiRequest<DashboardApiResponse> =>
  new ApiRequest(apiFetch, '/v2/timeline/dashboard', {
    queryParams: {
      ...getTimelineBlogQueryParams(),
      ...queryParams,
      reblog_info: true,
    },
  }),

    // eslint-disable-next-line no-restricted-syntax
    getTabs: (): ApiRequest<TabsApiResponse> => new ApiRequest(apiFetch, '/v2/tabs'),

    // eslint-disable-next-line no-restricted-syntax
    getRelatedPosts: (
    queryPost: string,
    blogName: string,
    context: string,
): ApiRequest<RelatedPostsApiResponse> =>
  new ApiRequest(
    apiFetch,
    '/v2/related/posts?fields%5Bblogs%5D=name%2Ctitle%2Curl%2Cavatar%2Ccan_be_followed%2C%3Ffollowed%2Ctheme%2Cuuid',
    {
      queryParams: {
        context,
        blog_name: blogName,
        query: queryPost,
      },
    },
  ),

    /* eslint-disable no-restricted-syntax */
    /**
     * This is different than the normal timeline fetches and for when you want to fetch more...
     * esoteric timelines (usually for development to see them render in production code).
     */
    getNakedTimeline: (timelineName: string, queryParams: {}): ApiRequest<DashboardApiResponse> =>
  new ApiRequest(apiFetch, '/v2/timeline', {
    queryParams: {
      ...getTimelineBlogQueryParams(),
      which: timelineName,
      ...queryParams,
    },
  }),
    /* eslint-enable no-restricted-syntax */

    // eslint-disable-next-line no-restricted-syntax
    getLikes: ({ limit, before, after }: LikesQueryParams): ApiRequest<LikesApiResponse> =>
  new ApiRequest(apiFetch, '/v2/user/likes', {
    queryParams: {
      ...getTimelineBlogQueryParams(),
      before,
      after,
      limit: limit || 21, // Defaulting to 21, which is a full grid "page" of 7 rows of 3
      reblog_info: true,
    },
  }),

    // eslint-disable-next-line no-restricted-syntax
    blogReorder: (reorderedBlogs: string[]): ApiRequest =>
    new ApiRequest(apiFetch, `/v2/user/reorder_blogs`, {
      method: 'PUT',
      body: {
        blog_names: reorderedBlogs,
      },
    }),

    // eslint-disable-next-line no-restricted-syntax
    getInboxData: (selectedBlogUuid: string): ApiRequest<InboxDataResponse> =>
  new ApiRequest(apiFetch, '/v2/conversations', {
    queryParams: {
      ...getBlogQueryParamsObject([...messagingBlogQueryParams, 'primary']),
      participant: selectedBlogUuid,
    },
  }),

    // eslint-disable-next-line no-restricted-syntax
    getPremiumPricePoints: (): ApiRequest<PremiumPricePointsApiResponse> =>
  new ApiRequest(apiFetch, '/v2/premium/price_points', {
    method: 'GET',
  }),

    // eslint-disable-next-line no-restricted-syntax
    getPremiumSubscription: (): ApiRequest<PremiumSubscriptionApiResponse> =>
  new ApiRequest(apiFetch, '/v2/premium/subscription', {
    method: 'GET',
  }),

    // eslint-disable-next-line no-restricted-syntax
    getRewardedAdInfo: (): ApiRequest<PremiumRewardedAdInfoResponse> =>
  new ApiRequest(apiFetch, '/v2/premium/rewarded-ad/info', {
    method: 'GET',
  }),

    // eslint-disable-next-line no-restricted-syntax
    rewardedAdStartAd: (
    ad: GoogleResponseInformation,
): ApiRequest<PremiumRewardedAdStartAdResponse> =>
  new ApiRequest(apiFetch, '/v2/premium/rewarded-ad/start-ad', {
    method: 'POST',
    body: { ad: ad },
  }),

    // eslint-disable-next-line no-restricted-syntax
    rewardedAdFinishAd: (token: string): ApiRequest<PremiumRewardedAdFinishAdResponse> =>
  new ApiRequest(apiFetch, '/v2/premium/rewarded-ad/finish-ad', {
    method: 'POST',
    body: { token: token },
  }),

    // eslint-disable-next-line no-restricted-syntax
    getBlogSubmissions: (
    blogName: string,
    offset: string | null,
    sort: string | null,
): ApiRequest<BlogSubmissionApiResponse> =>
  new ApiRequest(apiFetch, `/v2/user/inbox/${blogName}`, {
    method: 'GET',
    queryParams: {
      ...getTimelineBlogQueryParams(),
      offset: Number(offset) || 0,
      sort: sort,
    },
  }),

    // eslint-disable-next-line no-restricted-syntax
    getInboxSubmissions: ({
    offset,
    sort,
  }: {
    offset: string | null;
    sort: string | null;
  }): ApiRequest<InboxSubmissionApiResponse> =>
  new ApiRequest(apiFetch, '/v2/user/inbox', {
    method: 'GET',
    queryParams: {
      ...getTimelineBlogQueryParams(),
      reblog_info: true,
      offset: Number(offset) || 0,
      sort,
    },
  }),

    // eslint-disable-next-line no-restricted-syntax
    deleteBlogSubmissions: (blogName: string): ApiRequest =>
    new ApiRequest(apiFetch, `/v2/blog/${blogName}/posts/submission`, { method: 'DELETE' }),

    // eslint-disable-next-line no-restricted-syntax
    deleteInboxSubmissions: (): ApiRequest =>
    new ApiRequest(apiFetch, `/v2/user/inbox`, { method: 'DELETE' }),

    // eslint-disable-next-line no-restricted-syntax
    updateBlogSettings: (
    blogName: string,
    // `submissionsEnabled` is set with the `canSubmit` key
    params: UpdateBlogSettingsParams & Partial<{ canSubmit: boolean }>,
): ApiRequest<ApiFetchResponse<Record<string, never>>> =>
  new ApiRequest(apiFetch, `/v2/blog/${blogName}/settings`, {
    method: 'POST',
    body: convertObjectToSnakeCase(params),
  }),

    // eslint-disable-next-line no-restricted-syntax
    toggleTwitterShare: (blogName: string, enabled: boolean): ApiRequest =>
    new ApiRequest(apiFetch, `/v2/blog/${blogName}/social/twitter`, {
      method: 'POST',
      body: {
        twitter_send_posts: enabled,
      },
    }),

    // eslint-disable-next-line no-restricted-syntax
    generatePremiumCheckoutUrl: (
    period: SubscriptionPeriod,
    host: string,
    queryParams?: {
    source?: string;
    gift_receiver_tumblelog?: string;
    path?: string;
  },
): ApiRequest<PremiumCheckoutUrlResponse> =>
  new ApiRequest(apiFetch, `/v2/premium/checkout`, {
    queryParams: {
      period,
      host,
      path: generateSettingsPath({ page: SettingsPageName.AdFreeBrowsing }),
      ...queryParams,
    },
    method: 'GET',
  }),

    // eslint-disable-next-line no-restricted-syntax
    unsubscribeToPremium: (): ApiRequest<PremiumSubscriptionApiResponse> =>
  new ApiRequest(apiFetch, `/v2/premium/subscription`, {
    method: 'DELETE',
  }),

    // eslint-disable-next-line no-restricted-syntax
    resubscribeToPremium: (): ApiRequest<PremiumSubscriptionApiResponse> =>
  new ApiRequest(apiFetch, '/v2/premium/subscription', {
    method: 'PATCH',
    body: { status: SubscriptionsStatus.Active },
  }),

    // eslint-disable-next-line no-restricted-syntax
    getSubscriptionPlan: (blogName: string): ApiRequest<MembershipSubscriptionPlanResponse> =>
  new ApiRequest(apiFetch, `/v2/blog/${blogName}/memberships/subscription_plan`, {
    method: 'GET',
  }),

    // eslint-disable-next-line no-restricted-syntax
    getMembershipProvisionUrl: (
    blogName: string,
    host: string,
    path: string,
): ApiRequest<MembershipProvisionUrlResponse> =>
  new ApiRequest(apiFetch, `/v2/blog/${blogName}/memberships/provision`, {
    method: 'POST',
    queryParams: { host, path },
  }),

    // eslint-disable-next-line no-restricted-syntax
    getPricePoints: (): ApiRequest<PricePointsResponse> =>
  new ApiRequest(apiFetch, `/v2/memberships/price_points`, {
    method: 'GET',
  }),

    // eslint-disable-next-line no-restricted-syntax
    createSubscriptionSettings: ({
    blogName,
    description,
    creatorCategoryId,
    memberPerkIds,
    monthlyPrice,
  }: {
    blogName: string;
    description: string;
    creatorCategoryId: number;
    memberPerkIds: number[];
    monthlyPrice: number;
  }): ApiRequest =>
    new ApiRequest(apiFetch, `/v2/blog/${blogName}/memberships/subscription_plan`, {
      method: 'POST',
      body: {
        description,
        monthly_price: monthlyPrice,
        creator_category_id: creatorCategoryId,
        member_perk_ids: memberPerkIds,
      },
    }),

    // eslint-disable-next-line no-restricted-syntax
    updateSubscriptionSettings: ({
    blogName,
    description,
    memberPerks,
    monthlyPrice,
  }: {
    blogName: string;
    description?: string;
    memberPerks?: string[];
    monthlyPrice?: number;
  }): ApiRequest<MembershipSubscriptionPlanResponse> =>
  new ApiRequest(apiFetch, `/v2/blog/${blogName}/memberships/subscription_plan`, {
    method: 'PATCH',
    body: {
      ...(description && { description }),
      ...(monthlyPrice && { monthly_price: monthlyPrice }),
      ...(memberPerks && { member_perks: memberPerks }),
    },
  }),

    // eslint-disable-next-line no-restricted-syntax
    getAllMemberPerks: (): ApiRequest<MemberPerksResponse> =>
  new ApiRequest(apiFetch, `/v2/memberships/member_perks`, {
    method: 'GET',
  }),

    // eslint-disable-next-line no-restricted-syntax
    getCreatorSettingsStatus: (blogName: string): ApiRequest<CreatorSettingsStatusResponse> =>
  new ApiRequest(apiFetch, `/v2/blog/${blogName}/memberships/settings/status`, {
    method: 'GET',
  }),

    // eslint-disable-next-line no-restricted-syntax
    generateCheckoutUrl: (
    blogName: string,
    queryParams: {
    period: SubscriptionPeriod;
    host: string;
  },
): ApiRequest<GenerateCheckoutUrlResponse> =>
  new ApiRequest(apiFetch, `/v2/blog/${blogName}/memberships/checkout`, {
    queryParams,
    method: 'GET',
  }),

    // eslint-disable-next-line no-restricted-syntax
    subscribeToBlogMembership: (
    blogName: string,
    queryParams: {
    period: SubscriptionPeriod;
  },
): ApiRequest<MembershipsSusbcribeResponse> =>
  new ApiRequest(apiFetch, `/v2/blog/${blogName}/memberships/subscribe`, {
    queryParams,
    method: 'POST',
  }),

    // eslint-disable-next-line no-restricted-syntax
    unsubscribeFromSupporterBadge: (): ApiRequest<SupporterSubscribeResponse> =>
  new ApiRequest(apiFetch, `/v2/tumblrmart/subscriptions`, {
    method: 'DELETE',
    body: {
      product_group: 'supporter-badge',
    },
  }),

    // eslint-disable-next-line no-restricted-syntax
    unsubscribeToBlogMembership: (blogName: string): ApiRequest<MembershipsSusbcribeResponse> =>
  new ApiRequest(apiFetch, `/v2/blog/${blogName}/memberships/subscribe`, {
    method: 'DELETE',
  }),

    // eslint-disable-next-line no-restricted-syntax
    getSubscribers: (
    blogName: string,
    filter: SubscribersFilterMode,
): ApiRequest<MembershipSubscribersResponse> =>
  new ApiRequest(apiFetch, `/v2/blog/${blogName}/memberships/subscribers`, {
    method: 'GET',
    queryParams: {
      status: filter,
    },
  }),

    // eslint-disable-next-line no-restricted-syntax
    getSubscriptions: (
    filter: SubscriptionsFilterMode,
): ApiRequest<TumblrmartSubscriptionsResponse> =>
  new ApiRequest(apiFetch, `/v2/tumblrmart/subscriptions`, {
    method: 'GET',
    queryParams: {
      status: filter,
      view: 'web',
    },
  }),

    // eslint-disable-next-line no-restricted-syntax
    getPaymentMethod: (
    baseRoute: TumblrPayBaseRoute,
    host: string = '',
): ApiRequest<PaymentMethodResponse> =>
  new ApiRequest(apiFetch, `/v2/${baseRoute}/payment-method`, {
    method: 'GET',
    queryParams: { host },
  }),

    // eslint-disable-next-line no-restricted-syntax
    getPayoutsBalance: (blogName: string): ApiRequest<PayoutsBalanceResponse> =>
  new ApiRequest(apiFetch, `/v2/blog/${blogName}/payouts/balance`, {
    method: 'GET',
  }),

    // eslint-disable-next-line no-restricted-syntax
    getPayoutsList: (blogName: string): ApiRequest<PayoutsListResponse> =>
  new ApiRequest(apiFetch, `/v2/blog/${blogName}/payouts/list`, {
    method: 'GET',
  }),

    // eslint-disable-next-line no-restricted-syntax
    getMrecWaterfall: (
    root_supply_opportunity_instance_id?: string,
    refresh?: number,
    blogName?: string,
): ApiRequest<MrecWaterfallResponse> =>
  new ApiRequest(
    apiFetch,
    '/v2/redpop_ads/mrec_waterfall',
    root_supply_opportunity_instance_id
      ? {
        queryParams: {
          root_supply_opportunity_instance_id,
          refresh,
          tumblelog_id: blogName,
        },
      }
      : blogName
        ? { queryParams: { tumblelog_id: blogName } }
        : undefined,
  ),

    // Having two apiHelper endpoints helps prevent accidentally (not) batching
    // eslint-disable-next-line no-restricted-syntax
    sendMessage: (
    message: OutboundMessage,
    participants: SendMessageParticipants,
    queryParams = {},
): ApiRequest<ConversationResponse> => {
    const { path, options } = getPathAndOptionsForSendMessage({
      message,
      queryParams,
      participants: [participants],
      isBatch: false,
    });
    return new ApiRequest(apiFetch, path, options);
  },

  // eslint-disable-next-line no-restricted-syntax
  batchSendMessage: (
    message: BatchSendOutboundMessage,
    participants: SendMessageParticipants[],
    queryParams = {},
): ApiRequest<ConversationBatchResponse> => {
    const maxParticipantsPerBatch = 5; // This value is intrinsic to how the backend is written

    const params = {
      message,
      queryParams,
      participants,
      isBatch: true,
    };

    if (participants.length > maxParticipantsPerBatch) {
      const participantBatches: SendMessageParticipants[][] = Object.values(
        // Group into batches, based on index.
        groupBy(participants, (_item, index) => Math.floor(index / maxParticipantsPerBatch)),
      );

      // We mock up an apiFetch object here for our ApiRequest constructor to call into.
      // In doing so, it will kick off the fetches for the batch and return the amalgamated response.
      const _apiFetch: ApiFetch = (): Promise<any> =>
      Promise.all(
        participantBatches.map((participantsBatch) =>
          getBatchSendMessageRequest(apiFetch, {
            ...params,
            participants: participantsBatch,
          })
            .fetch()
            // If we fail on any, nbd, keep it going
            .catch(() => ({ response: {} as Record<string, Conversation> }))
    ),
    ).then((batchResponses) => ({
        // We bundle all the responses together in this faux-response
        response: batchResponses.reduce<Conversation[]>((conversations, { response }) => {
          // Since the response object is an object with string keys in addition to `0`, `1`, etc, we
          // convert it here to tease them out.
          Object.keys(response).forEach((key) => {
            if (!isNaN(Number(key))) {
              conversations.push(response[key]);
            }
          });
          return conversations;
        }, []),
      }));

      return new ApiRequest(_apiFetch, '');
    }

    return getBatchSendMessageRequest(apiFetch, params);
  },

  // eslint-disable-next-line no-restricted-syntax
  getConversation: (
    { selectedBlogName, otherParticipantName, conversationId }: ConversationWindowObject,
    // Optional queryParams for filtering the data you get from this response
    _queryParams?: { before?: string; after?: string },
): ApiRequest<ConversationResponse> => {
    const selectedBlog = selectedBlogName ? getBlogNetworkDomain(selectedBlogName) : undefined;
    const queryParams: any = {
      participant: selectedBlog,
      ...getMessagingQueryParams(),
      ..._queryParams,
    };

    if (conversationId) {
      queryParams.conversation_id = conversationId;
    } else if (otherParticipantName) {
      queryParams['participants[0]'] = selectedBlog;
      queryParams['participants[1]'] = getBlogNetworkDomain(otherParticipantName);
    } else {
      throw new Error("Can't fetch conversation without either ID or both participant names");
    }

    return new ApiRequest(apiFetch, '/v2/conversations/messages', { queryParams });
  },

  // eslint-disable-next-line no-restricted-syntax
  deleteConversation: (
    id: number | string,
    selectedBlogName: string,
    queryParams = {},
): ApiRequest =>
    new ApiRequest(apiFetch, '/v2/conversations/messages', {
      queryParams: {
        ...queryParams,
        conversation_id: id,
        participant: getBlogNetworkDomain(selectedBlogName),
      },
      method: 'DELETE',
    }),

    // eslint-disable-next-line no-restricted-syntax
    flagConversation: (
    type: FlagConversationType,
    selectedBlogName: string,
    conversationId: number | string,
    context: string = 'inline',
    queryParams = {},
): ApiRequest =>
    new ApiRequest(apiFetch, '/v2/conversations/flag', {
      queryParams,
      method: 'POST',
      body: {
        type,
        context,
        conversation_id: conversationId,
        participant: getBlogNetworkDomain(selectedBlogName),
      },
    }),

    // eslint-disable-next-line no-restricted-syntax
    markConversationAsRead: (
    selectedBlogName: string,
    conversationId: string | number,
): ApiRequest =>
    new ApiRequest(apiFetch, '/v2/conversations/mark_as_read', {
      method: 'POST',
      body: {
        conversation_id: conversationId,
        participant: getBlogNetworkDomain(selectedBlogName),
      },
    }),

    // eslint-disable-next-line no-restricted-syntax
    ccpaOptOut: (): ApiRequest =>
    new ApiRequest(apiFetch, '/v2/ccpa/opt_out', {
      method: 'GET',
    }),

    // eslint-disable-next-line no-restricted-syntax
    subscribeToBlog: (blogName: string): ApiRequest =>
    new ApiRequest(apiFetch, `/v2/blog/${blogName}/subscription`, {
      method: 'POST',
    }),

    // eslint-disable-next-line no-restricted-syntax
    unsubscribeToBlog: (blogName: string): ApiRequest =>
    new ApiRequest(apiFetch, `/v2/blog/${blogName}/subscription`, {
      method: 'DELETE',
    }),

    // eslint-disable-next-line no-restricted-syntax
    followBlog: (
    blogIdentifier: string, // Either a blog name, blog URL or an email address
    extraParams?: FollowRequestParams,
): ApiRequest<FollowApiResponse> => {
    const blog = blogIdentifier.toLowerCase();
    const isEmail = blog.includes('@') && !/^https?:\/\//.test(blog);
    return new ApiRequest(apiFetch, `/v2/user/follow`, {
      method: 'POST',
      body: {
        ...(isEmail && { email: blog }),
        ...(!isEmail && { url: blog.includes('.') ? blog : getBlogNetworkDomain(blog) }),
        placement_id: extraParams?.placementId,
        context: extraParams?.source,
        tag: extraParams?.tag,
      },
    });
  },

  // eslint-disable-next-line no-restricted-syntax
  unfollowBlog: (blogUrl: string, extraParams?: FollowRequestParams): ApiRequest =>
    new ApiRequest(apiFetch, `/v2/user/unfollow`, {
      method: 'POST',
      body: {
        url: blogUrl,
        placement_id: extraParams?.placementId,
        context: extraParams?.source,
        tag: extraParams?.tag,
      },
    }),

    // eslint-disable-next-line no-restricted-syntax
    followedBy: (blogName: string, followedBy: string): ApiRequest<FollowedByApiResponse> =>
  new ApiRequest(apiFetch, `/v2/blog/${blogName}/followed_by`, {
    method: 'GET',
    queryParams: {
      query: followedBy,
    },
  }),

    // eslint-disable-next-line no-restricted-syntax
    postAPost: ({
    selectedBlogName,
    selectedBlog,
    logEvent,
    isLongPost,
    placementId,
    reblogType,
    isAsk,
    isAnonymousAsk,
    otherBlogName,
    communityLabels,
    tabId,
    post: {
      parentPostId,
      id,
      content,
      tags,
      sendToTwitter,
      adsParams,
      reblogKey,
      hideTrail,
      parentTumblelogUuid,
      layout,
      sourceUrl,
      state,
      publishOn,
      slug,
      date,
      isPrivate,
      earnedId,
      shouldShowTip,
      canBeTipped,
      interactabilityReblog,
      interactabilityBlaze,
      communityId,
    },
  }: {
    selectedBlogName: string;
    selectedBlog?: Blog;
    logEvent: LogEvent;
    isLongPost?: boolean;
    isAsk?: boolean;
    isAnonymousAsk?: boolean;
    otherBlogName?: string;
    placementId?: string;
    reblogType?: ReblogType;
    communityLabels?: CommunityLabelPost;
    tabId?: string;
    post: NewOrEditablePost;
  }): ApiRequest<any> => {
    const isReblog = !!parentPostId;
    const isEdit = !!id;

    class PostAPostRequest extends ApiRequest {
      public fetch = (onFulfilled?: OnFulfilled<any, any>) =>
      super.fetch().then((response) => {
      const eventDetails = {
        placement_id: placementId,
        has_tip: !!shouldShowTip,
        tab: tabId,
      };
      if (isReblog) {
        // Why force callers to remember to log the reblog event? Let's do it automatically <3
        logEvent({
          eventDetails: {
            ...eventDetails,
            earned_id: earnedId,
            is_long_post: isLongPost,
          },
          eventName: KrakenEvent.ClientReblog,
        });
      } else if (isEdit) {
        logEvent({
          eventDetails,
          eventName: KrakenEvent.EditSuccess,
        });
      } else {
      logEvent({
                 eventDetails,
                 eventName: KrakenEvent.PostSuccess,
               });
    }

    return onFulfilled?.(response) || response; // Whatever we've got, just keep throwing it down the chain. :puff of smoke: you saw nothing!
  });
  }

    if (isAsk) {
      const askLayout: AskLayout = {
        type: LayoutType.Ask,
        blocks: content.map((_, index) => {
          return index;
        }),
        attribution: isAnonymousAsk || !selectedBlog
          ? undefined
          : {
            type: 'blog',
            blog: selectedBlog,
          },
      };

      const askBody: AskRequestBody = {
        content,
        layout: [askLayout],
        send_to_facebook: false,
        send_to_twitter: false,
        context: 'Blog',
        state: PostState.Ask,
      };

      return new PostAPostRequest(apiFetch, `/v2/blog/${otherBlogName}/posts`, {
        body: convertObjectToSnakeCase(askBody),
        method: 'POST',
      });
    }

    const communityLabelCategories: string[] = [];
    const hasCommunityLabel = isCategoryActive(communityLabels?.active);
    if (communityLabels) {
      const entries = Object.entries(communityLabels.categories) as Array<
      [CommunityLabelCategory, CommunityLabelCategoryValue]
      >;
      for (const [category, value] of entries) {
        if (isCategoryActive(value)) {
          communityLabelCategories.push(snakeCase(category));
        }
      }
    }

    // Remove undefined keys and convert to snake_case.
    const body: PostRequestBody = convertObjectToSnakeCase(
      filterProperties(
        {
          reblogType,
          placementId,
          layout,
          state,
          sendToTwitter,
          adsParams,
          reblogKey,
          hideTrail,
          parentTumblelogUuid,
          parentPostId,
          sourceUrl,
          publishOn,
          content,
          slug,
          date,
          isPrivate,
          earnedId,
          canBeTipped,
          interactabilityReblog,
          interactabilityBlaze,
          community: communityId,
          tags: tags?.join(', '),
          hasCommunityLabel,
          communityLabelCategories,
        },
        (_key, value) => value !== undefined,
      ),
    );

    return new PostAPostRequest(
      apiFetch,
      `/v2/blog/${selectedBlogName}/posts${isEdit ? `/${id}` : ''}`,
      { body, method: isEdit ? 'PUT' : 'POST' },
    );
  },

  // eslint-disable-next-line no-restricted-syntax
  pinPost: (selectedBlogName: string, postId: string | number) =>
    new ApiRequest(apiFetch, `/v2/blog/${selectedBlogName}/posts/${postId}/pin`, {
      method: 'POST',
    }),

    // eslint-disable-next-line no-restricted-syntax
    unpinPost: (selectedBlogName: string, postId: string | number) =>
    new ApiRequest(apiFetch, `/v2/blog/${selectedBlogName}/posts/${postId}/pin`, {
      method: 'DELETE',
    }),

    // eslint-disable-next-line no-restricted-syntax
    votePoll: (pollId: string, selected: number[]): ApiRequest<VotePollResponse> =>
  new ApiRequest(apiFetch, `/v2/polls/${pollId}`, {
    method: 'POST',
    body: { selected },
  }),

    // eslint-disable-next-line no-restricted-syntax
    quickPublishPost: (blogUuid: string, postId: string | number): ApiRequest =>
    new ApiRequest(apiFetch, `/v2/blog/${blogUuid}/post/edit`, {
      method: 'POST',
      body: {
        id: postId,
        state: PostState.Published,
      },
    }),

    // eslint-disable-next-line no-restricted-syntax
    getNotes: (
    postBlogUuid: string,
    { id, mode, beforeTimestamp, sort }: PostActivityQueryParams,
): ApiRequest<NotesResponse> =>
  new ApiRequest(apiFetch, `/v2/blog/${postBlogUuid}/notes`, {
    queryParams: {
      id,
      mode,
      beforeTimestamp,
      sort,
    },
  }),

    // eslint-disable-next-line no-restricted-syntax
    getNotesTimeline: (
    postBlogUuid: string,
    { id, mode, beforeTimestamp, sort, pinPreviewNote }: PostActivityQueryParams,
): ApiRequest<NotesResponse> =>
  new ApiRequest(apiFetch, `/v2/blog/${postBlogUuid}/post/${id}/notes/timeline`, {
    queryParams: {
      mode,
      beforeTimestamp,
      sort,
      pin_preview_note: pinPreviewNote,
      ...getBlogQueryParamsObject(['avatar', 'theme', 'name', 'liveNow']),
    },
  }),

    // eslint-disable-next-line no-restricted-syntax
    deleteNote: (
    postBlogName: string,
    noteBlogName: string,
    noteCreatedTime: number,
    postId: string | number,
): ApiRequest =>
    new ApiRequest(apiFetch, `/v2/blog/${postBlogName}/notes/delete`, {
      method: 'POST',
      body: {
        note_tumblelog: noteBlogName,
        note_created_time: noteCreatedTime,
        post_id: postId,
      },
    }),

    // eslint-disable-next-line no-restricted-syntax
    flagNote: (
    postBlogName: string,
    noteBlogName: string,
    noteCreatedTime: number,
    postId: string | number,
): ApiRequest =>
    new ApiRequest(apiFetch, `/v2/blog/${postBlogName}/notes/flag`, {
      method: 'POST',
      body: {
        flagged_note_tumblelog_name: noteBlogName,
        flagged_note_created_time: noteCreatedTime,
        post_id: postId,
      },
    }),

    // eslint-disable-next-line no-restricted-syntax
    enableDesktopEditor: () =>
    new ApiRequest(apiFetch, `/v2/settings/desktop_editor`, {
      method: 'POST',
    }),

    // eslint-disable-next-line no-restricted-syntax
    disableDesktopEditor: () =>
    new ApiRequest(apiFetch, `/v2/settings/desktop_editor`, {
      method: 'DELETE',
    }),

    // eslint-disable-next-line no-restricted-syntax
    getImageInfo: (image_path: string): ApiRequest<ImageInfoResponse> =>
  new ApiRequest(apiFetch, '/v2/image/info', {
    queryParams: {
      image_path,
      ...getBlogQueryParamsObject([
        'avatar',
        'name',
        'title',
        'url',
        'blogViewUrl',
        'description',
      ]),
    },
  }),

    // eslint-disable-next-line no-restricted-syntax
    preUploadImageForNpf: (imageFile: File): ApiRequest<FetchedImageResponse> => {
    const formData = new FormData();
    formData.append('file', imageFile);

    return new ApiRequest(apiFetch, '/v2/media/image', {
      method: 'POST',
      body: formData,
      headers: { ['Content-Type']: 'multipart/form-data' },
    });
  },

  // eslint-disable-next-line no-restricted-syntax
  preUploadVideoForNpf: (
    videoFile: File,
    tumblelog?: string,
): ApiRequest<FetchedVideoResponse> => {
    const formData = new FormData();
    formData.append('file', videoFile);

    return new ApiRequest(apiFetch, '/v2/media/video', {
      method: 'POST',
      body: formData,
      headers: { ['Content-Type']: 'multipart/form-data' },
      queryParams: tumblelog ? { tumblelog } : {},
    });
  },

  // eslint-disable-next-line no-restricted-syntax
  preUploadAudioForNpf: (audioFile: File): ApiRequest<FetchedAudioResponse> => {
    const formData = new FormData();
    formData.append('file', audioFile);

    return new ApiRequest(apiFetch, '/v2/media/audio', {
      method: 'POST',
      body: formData,
      headers: { ['Content-Type']: 'multipart/form-data' },
    });
  },

  // eslint-disable-next-line no-restricted-syntax
  getMentionSuggestions: (blogNamePartial?: string): ApiRequest<MentionsResponse> =>
  new ApiRequest(
    apiFetch,
    `/v2/mention${blogNamePartial && blogNamePartial.length ? `/${blogNamePartial}` : ''}`,
    { method: 'GET' },
  ),

    // eslint-disable-next-line no-restricted-syntax
    promote: (
    /** Name or UUID */
    blogIdentifier: string,
    { isUnpromote, postId, tags, endDate }: PromoteOptions,
): ApiRequest =>
    new ApiRequest(
      apiFetch,
      `/v2/blog/${blogIdentifier}${postId ? `/posts/${postId}` : ''}/promote`,
      {
        method: isUnpromote ? 'DELETE' : 'POST',
        body: { tags, end_date: endDate },
      },
    ),

    // eslint-disable-next-line no-restricted-syntax
    postReply: (
    postId: string | number,
    replyText: string,
    reblogKey: string,
    blogName: string,
    placementId?: string,
    replyAs?: Blog['name'],
): ApiRequest<PostReplyResponse> =>
  new ApiRequest(apiFetch, '/v2/user/post/reply', {
    method: 'POST',
    body: {
      post_id: postId,
      reply_text: replyText,
      reblog_key: reblogKey,
      tumblelog: blogName,
      placement_id: placementId,
      reply_as: replyAs,
    },
  }),

    // eslint-disable-next-line no-restricted-syntax
    subscribeToPost: (postBlogName: string, postId: string | number): ApiRequest =>
    new ApiRequest(apiFetch, `/v2/blog/${postBlogName}/posts/${postId}/subscription`, {
      method: 'POST',
    }),

    // eslint-disable-next-line no-restricted-syntax
    unsubscribeToPost: (postBlogName: string, postId: string | number): ApiRequest =>
    new ApiRequest(apiFetch, `/v2/blog/${postBlogName}/posts/${postId}/subscription`, {
      method: 'DELETE',
    }),

    // eslint-disable-next-line no-restricted-syntax
    getActivityNotifications: (
    blogName: string,
    allowOrDeny: 'allow' | 'deny',
    allowOrDenySet: ActivityFilterSet,
): ApiRequest<ActivityNotificationResponse> =>
  new ApiRequest(apiFetch, `/v2/blog/${blogName}/notifications`, {
    method: 'GET',
    queryParams: getFilterQueryParams(allowOrDeny, allowOrDenySet),
  }),

    // eslint-disable-next-line no-restricted-syntax
    markActivityAsRead: (blogName: string): ApiRequest<any> =>
  new ApiRequest(apiFetch, `/v2/blog/${blogName}/activity_last_read`, {
    method: 'POST',
  }),

    // eslint-disable-next-line no-restricted-syntax
    getActivityStats: (
    blogName: string,
    range: ActivityStatsRange,
    graph: ActivityStatsGraph = 'notes',
    granularity?: ActivityStatsGranularity,
): ApiRequest<ActivityStatsResponse> =>
  new ApiRequest(
    apiFetch,
    `/v2/blog/${blogName}/activity/${
      graph === 'notes'
        ? 'notes'
        : graph === 'new'
          ? 'followers/new'
          : 'followers/total'
    }/${range}/${granularity || ''}`,
    {
      method: 'GET',
      queryParams: getBlogQueryParamsObject([
        'name',
        'avatar',
        'title',
        'url',
        'blogViewUrl',
        'theme',
        'followed',
      ]),
    },
  ),

    // eslint-disable-next-line no-restricted-syntax
    getFollowing: (offset?: number | string): ApiRequest<FollowingApiResponse> =>
  new ApiRequest(apiFetch, `/v2/user/following`, {
    method: 'GET',
    queryParams: {
      ...getBlogQueryParamsObject([
        'name',
        'avatar',
        'title',
        'url',
        'blogViewUrl',
        'uuid',
        'descriptionNpf',
        'updated',
        'isFollowingYou',
        'followed',
        'durationBlogFollowingYou',
        'durationFollowingBlog',
      ]),
      offset,
    },
  }),

    // eslint-disable-next-line no-restricted-syntax
    getFollowers: (blogName: string, offset?: number | string): ApiRequest<FollowersApiResponse> =>
  new ApiRequest(apiFetch, `/v2/blog/${blogName}/followers`, {
    method: 'GET',
    queryParams: {
      ...getBlogQueryParamsObject([
        'name',
        'avatar',
        'title',
        'url',
        'blogViewUrl',
        'uuid',
        'descriptionNpf',
        'followed',
        'durationBlogFollowingYou',
        'durationFollowingBlog',
      ]),
      offset,
    },
  }),

    // eslint-disable-next-line no-restricted-syntax
    getDrafts: (
    blogName: string,
    { before_id }: DraftsQueryParams = {},
): ApiRequest<DraftsApiResponse> =>
  new ApiRequest(apiFetch, `/v2/blog/${blogName}/posts/draft`, {
    method: 'GET',
    queryParams: {
      ...getTimelineBlogQueryParams(),
      before_id,
      reblog_info: true,
    },
  }),

    // eslint-disable-next-line no-restricted-syntax
    getBlogPostCounts: (): ApiRequest<UserCountsResponseRaw> =>
  new ApiRequest(apiFetch, `/v2/user/counts`, {
    method: 'GET',
    queryParams: {
      [UserCountsQueryParams.blogPostCounts]: true,
    },
  }),

    // eslint-disable-next-line no-restricted-syntax
    getAppealablePosts: (blogName: string): ApiRequest<ReviewApiResponse> =>
  new ApiRequest(apiFetch, `/v2/blog/${blogName}/posts/review`, {
    method: 'GET',
    queryParams: {
      ...getTimelineBlogQueryParams(),
      reblog_info: true,
    },
  }),

    // eslint-disable-next-line no-restricted-syntax
    getBlogLimits: (blogName: string): ApiRequest<LimitsApiResponse> =>
  new ApiRequest(apiFetch, `/v2/blog/${blogName}/limits`, {
    method: 'GET',
  }),

    // eslint-disable-next-line no-restricted-syntax
    getRelatedBlogs: (blogName: string): ApiRequest<RelatedBlogsResponse> =>
  new ApiRequest(apiFetch, '/v2/related/blogs', {
    queryParams: {
      tumblelog: blogName,
      format: 'blog_cards',
      ...getBlogQueryParamsObject(getPostsQueryParamsThatRenderBlogCards),
      reblog_info: true,
      include_followed_blogs: true,
    },
  }),

    // eslint-disable-next-line no-restricted-syntax
    getHubsHeader: (
    /** hub name should be unencoded since the api request handles that. */
    hubName: string,
): ApiRequest<HubsHeaderResponse> =>
  new ApiRequest(apiFetch, `/v2/hubs/${encodeURIComponent(hubName)}/header_info`, {
    method: 'GET',
  }),

    // eslint-disable-next-line no-restricted-syntax
    getHubsTimeline: (
    /** hub name should be unencoded since the api request handles that. */
    hubName: string,
    hubsSort?: SearchApiRequestMode | undefined,
    queryParams?: {
      query_source?: HubsApiQuerySource;
    },
): ApiRequest<DashboardApiResponse> =>
  new ApiRequest(apiFetch, `/v2/hubs/${encodeURIComponent(hubName)}/timeline`, {
    method: 'GET',
    queryParams: {
      ...getBlogQueryParamsObject(getPostsQueryParamsThatRenderBlogCards),
      sort: hubsSort,
      // This limit is important! The stream is configured to inject the tags carousel in the 14th element,
      // which we need to render the first page. Until the streamBuilder process has been updated to either
      // put this element in earlier or allow it to be retrieved from its own endpoint, we maintain that we
      // request at least 14 results per page.
      limit: 14,
      ...(queryParams ? queryParams : {}),
    },
  }),

    // eslint-disable-next-line no-restricted-syntax
    getRadar: ({
    debugPostId = '',
    limit = '5',
  }: {
    debugPostId?: string;
    limit?: string;
  }): ApiRequest<RadarResponse> =>
  new ApiRequest(apiFetch, '/v2/radar', {
    method: 'GET',
    queryParams: {
      ...getBlogQueryParamsObject([
        'name',
        'avatar',
        'description',
        'theme',
        'title',
        'url',
        'blogViewUrl',
        'uuid',
        'canMessage',
        'canBeFollowed',
        'followed',
        'isAdult',
      ]),
      limit,
      radar_post_id: debugPostId,
    },
  }),

    // eslint-disable-next-line no-restricted-syntax
    ignitePost: (
    post_id: string | number,
    tumblelog_uuid: string | undefined,
    product_slug: string,
    redirect_url: string,
    audience: string,
    language: string,
    from_tumblelog_uuid?: string,
): ApiRequest<any> =>
  new ApiRequest(apiFetch, '/v2/ignite/checkout', {
    queryParams: {
      post_id,
      tumblelog_uuid,
      redirect_url: redirect_url,
      product_slug,
      country: audience,
      language: language,
      from_tumblelog_uuid,
    },
  }),

    // eslint-disable-next-line no-restricted-syntax
    igniteExtinguishPost: (
    post_id: string,
    tumblelog_uuid: string | undefined,
    transaction_uuid: string | undefined,
): ApiRequest<any> =>
  new ApiRequest(apiFetch, `/v2/ignite/campaign/extinguish`, {
    method: 'PUT',
    body: {
      tumblelog_uuid: tumblelog_uuid,
      post_id: post_id,
      transaction_uuid: transaction_uuid,
    },
  }),

    // eslint-disable-next-line no-restricted-syntax
    igniteCancelPendingBlaze: (
    post_id: string,
    tumblelog_uuid: string | undefined,
    transaction_uuid: string | undefined,
): ApiRequest<any> =>
  new ApiRequest(apiFetch, `/v2/ignite/campaign/cancel`, {
    method: 'PUT',
    body: {
      tumblelog_uuid: tumblelog_uuid,
      post_id: post_id,
      transaction_uuid: transaction_uuid,
    },
  }),

    // eslint-disable-next-line no-restricted-syntax
    logBlogDismissal: (blogUrl: string): ApiRequest =>
    new ApiRequest(apiFetch, '/v2/user/dismiss/recommend', {
      method: 'POST',
      body: {
        tumblelog: blogUrl,
      },
    }),

    // eslint-disable-next-line no-restricted-syntax
    changeEmailAddress: (emailAddress: string, currentPassword: string): ApiRequest =>
    new ApiRequest(apiFetch, '/v2/account', {
      method: 'PATCH',
      body: {
        email: emailAddress,
        password_current: currentPassword,
      },
    }),

    // eslint-disable-next-line no-restricted-syntax
    changePassword: (currentPassword: string, newPassword: string): ApiRequest =>
    new ApiRequest(apiFetch, '/v2/account', {
      method: 'PATCH',
      body: {
        password: newPassword,
        password_current: currentPassword,
      },
    }),

    // eslint-disable-next-line no-restricted-syntax
    getUserSettings: (): ApiRequest<SettingsResponse> =>
  new ApiRequest(apiFetch, '/v2/user/settings'),

    // eslint-disable-next-line no-restricted-syntax
    updateUserSettings: (settings: Partial<SettingsState>): ApiRequest =>
    new ApiRequest(apiFetch, '/v2/user/settings', {
      method: 'POST',
      body: convertObjectToSnakeCase(settings),
    }),

    // eslint-disable-next-line no-restricted-syntax
    acceptTippingTerms: () =>
    new ApiRequest(apiFetch, '/v2/tipping/terms_of_service', { method: 'POST' }),

    // eslint-disable-next-line no-restricted-syntax
    generateTippingCheckoutUrl: (
    blogName: string,
    queryParams: {
    tip_amount_cents: number;
    is_anonymous: boolean;
    post_id?: string | number;
    tip_message?: string;
    host: string;
    path: string;
  },
): ApiRequest<GenerateCheckoutUrlResponse> =>
  new ApiRequest(apiFetch, `/v2/blog/${blogName}/tipping/checkout`, {
    queryParams,
    method: 'GET',
  }),
};
}

export const notFoundOnUnauthed = (error: ApiError) => {
  if (error.status === 401) {
    throw new ApiError(404, 'Not found', error.path, error.response);
  }

  throw error;
};

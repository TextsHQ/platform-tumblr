import { BlogQueryParams } from './types/blog';
import { snakeCase } from 'utils/ascii-word-case';

export interface BlogQueryParamsForApi {
  'fields[blogs]'?: string;
  reblog_info?: boolean;
  /** This param allows you to specify whether any post attributions in the response
   *  should also include the array of tags associated with it.
   */
  post_attribution_tags?: boolean;
}

export interface RadarQueryParams extends BlogQueryParamsForApi {
  sub_component?: 'post' | 'curated_tags';
  order?: 'chrono' | 'random' | 'staff_picks';
}

export function getBlogQueryParamsObject(
  queryParams: ReadonlyArray<BlogQueryParams>,
): BlogQueryParamsForApi {
  return {
    ['fields[blogs]']: massageQueryParams(new Set(queryParams)).join(','),
  };
}

export const defaultTimelineQueryParams: BlogQueryParams[] = [
  'name',
  'avatar',
  'title',
  'url',
  'blogViewUrl',
  'isAdult',
  'isMember',
  'descriptionNpf',
  'uuid',
  'canBeFollowed',
  'followed',
  'advertiserName',
  'theme',
  'primary',
  'isPaywallOn',
  'paywallAccess',
  'subscriptionPlan',
  'tumblrmartAccessories',
  'liveNow',
];

export const defaultGetPostsQueryParams: BlogQueryParams[] = [
  ...defaultTimelineQueryParams,
  'primary',
  'shareLikes',
  'shareFollowing',
  'canSubscribe',
  'subscribed',
  'ask',
  'canSubmit',
  'isBlockedFromPrimary',
  'isBloglessAdvertiser',
  'tweet',
  'isPasswordProtected',
  'tumblrmartAccessories',
];

export const getPostsQueryParamsThatRenderBlogCards: BlogQueryParams[] = [
  ...defaultGetPostsQueryParams,
  'theme',
];

export const getTimelineBlogQueryParams = (additionalParams?: BlogQueryParams[]) =>
  getBlogQueryParamsObject([...defaultTimelineQueryParams, ...(additionalParams || [])]);

const optionalParams: BlogQueryParams[] = [
  'primary',
  'isMember',
  'followed',
  'followers',
  'admin',
  'drafts',
  'queue',
  'hasFlaggedPosts',
  'tweet',
  'linkedAccounts',
  'topTags',
  'canSubmit',
  'isBlockedFromPrimary',
  'timezone',
  'timezoneOffset',
  'analyticsUrl',
  'advertiserName',
  'isPremiumPartner',
  'isBloglessAdvertiser',
  'isBrandSafe',
  'badge',
  'badgeText',
  'topTagsFewer',
  'topTagsAll',
  'isFollowingYou',
  'durationBlogFollowingYou',
  'durationFollowingBlog',
  'canOnboardToPaywall',
  'isTumblrpayOnboarded',
  'isPaywallOn',
  'paywallAccess',
  'subscriptionPlan',
  'wasPaywallOn',
  'isTippingOn',
  'allowSearchIndexing',
  'notifications',
  'shouldShowTip',
  'shouldShowGift',
  'shouldShowTumblrmartGift',
  'canAddTipMessage',
  'showAuthorAvatar',
  'supportsReplies',
  'tippingPostsDefault',
  'created',
  'liveNow',
  'liveStreamingUserId',
];

// TODO [PW-1562]: Dedupe in here to allow composition of query param bundles
function massageQueryParams(queryParams: Set<BlogQueryParams>): string[] {
  return Array.from(queryParams).map((param) => {
    const indicateOptionalParamChar: string = optionalParams.indexOf(param) !== -1 ? '?' : '';
    return indicateOptionalParamChar + snakeCase(param);
  });
}

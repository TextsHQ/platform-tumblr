import { defaultFilterQueryParams, FilterMenuState } from 'types/filter-menu';

import { FilterType } from './api-fetch';
import { PostRole, PostSort, PostTypeForUI } from './posts';
import { SearchApiRequestMode } from './search';

export interface PeeprRouteParams {
  peeprBlogname: string;
  peeprPostId?: string;
  peeprPostSlug?: string;
}

export interface TabInfo {
  key: string;
  translate: string;
  hasLock?: boolean;
}

export const TabType = {
  Posts: 'Posts',
  Likes: 'Likes',
  Following: 'Following',
} as const;

export interface PeeprTagParams extends PeeprOptionalSearchParams {
  peeprTag: string;
}

export interface PeeprSearchParams extends PeeprOptionalSearchParams {
  peeprSearchTerm: string;
}

export interface PeeprOptionalSearchParams {
  peeprSearchMode?: SearchApiRequestMode;
  peeprPostRole?: PostRole;
  peeprSelectedPostType?: PostTypeForUI;
}

export interface UnknownPeeprSearchParams {
  param1?: SearchApiRequestMode | PostRole | PostTypeForUI;
  param2?: SearchApiRequestMode | PostRole | PostTypeForUI;
}

// NOTE: as memberships paths build out, this param will likely also want to be expanded/modified to be scalable
export interface PeeprMembershipParams {
  isSupport?: boolean;
}

export interface PeeprTippingParams {
  isTipping?: boolean;
}

export interface PeeprLikesParams {
  showLikes?: boolean;
}

export interface PeeprFollowingParams {
  showFollowing?: boolean;
}
/**
 * The info received from the url and the info sent to the API are not the same so this function will
 * take care of converting the info from the URL to the API format.
 */
export function convertFiltersPeeprSearchParams({
  peeprSearchMode,
  peeprPostRole,
  peeprSelectedPostType,
}: PeeprSearchParams | PeeprTagParams): FilterType {
  return {
    ...defaultFilterQueryParams,
    postRole: peeprPostRole,
    postType: peeprSelectedPostType,
    ...(peeprSearchMode === 'top' && { postSort: PostSort.PopularityDesc }),
  };
}

export function convertFilterQueryParamsToPeeprParams({
  postSort,
  postRole,
  postType,
}: FilterMenuState): PeeprOptionalSearchParams {
  return {
    peeprSelectedPostType: postType,
    ...(postRole !== 'any' && { peeprPostRole: postRole }),
    ...(postSort === PostSort.PopularityDesc && { peeprSearchMode: 'top' }),
  };
}

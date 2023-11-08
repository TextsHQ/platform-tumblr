import { ElementLinks } from './api-link';
import { TagV2 } from './posts';
import {
  CarouselElement,
  TimelineObject,
  TimelineObjectCarouselType,
  TimelineObjectType,
} from './timeline';

export interface TagResource {
  thumbUrl: string;
}

export interface Tag {
  id: string;
  resources: TagResource[];
  label: string;
  relatedTags: string[];
}

export interface SearchTag {
  featured?: boolean;
  isTracked?: boolean;
  tag: string;
  url?: string;
  followers?: number;
  trending?: boolean;
  recentPosts?: number;
  socialProof?: {
    showFollowerCount: boolean;
    showRecentPostsCount: boolean;
    followerCount: string; // formatted value
    recentPostsCount: string; // formatted value
  };
  thumbUrl?: string;
}

// NOTE: There exist two ways to fetch the tags that a user follows with slightly
// different information on each of them (maybe we should consolidate the api routes?)
// Regardless, please be cognizant of which one you want to use.
export interface FollowingTag {
  id: string;
  name: string;
  thumbUrl?: string;
  unreadCount?: string;
  trending?: boolean;
  recentPosts?: number;
  followers?: number;
  socialProof?: {
    showFollowerCount: boolean;
    showRecentPostsCount: boolean;
    followerCount: string; // formatted value
    recentPostsCount: string; // formatted value
  };
}

// TODO [https://jira.tumblr.net/browse/PW-1605]
// Stop pointing to this interface and move the carousel stuff
// into a new CarouselGeneralTag interface (or something that doesn't lean into FollowedTag)
export interface FollowedTag extends CarouselElement {
  tagName: string;
  postsCount?: number;
  objectType: TimelineObjectCarouselType.FollowedTag;
  backgroundImage: string;
  backgroundColor: string;
  links?: ElementLinks;
  tagV2?: TagV2;
}

export interface ShortFormatedFollowedTag extends CarouselElement {
  tagId: number;
  tagName: string;
  postsCount?: number;
}

export interface TrendingTagTimelineObject extends TimelineObject {
  objectType: TimelineObjectType.TrendingTag;
  description?: string;
  label: string;
  links: {
    destination: {
      href: string;
      meta: { source: string };
      queryParams: { sort?: string };
      type: 'web';
    };
  };
  loggingId: string;
  position: number;
  positionColor: string;
  relatedTags: string[];
  resourceIds: string[];
  resources: [
    {
      featured: boolean;
      isTracked: boolean;
      tag: string;
      thumbUrl: string;
    },
  ];
  topicTitle: string;
}

export interface TagTimelineObject extends TimelineObject {
  hubName: string;
  objectType: TimelineObjectType.TagInfoRow | TimelineObjectType.CommunityHubHeaderCard;
  isFollowed: boolean;
  followersCount?: string;
  followersCountInt?: number;
  newPostsCount: string;
  newPostsCountInt: number;
  backgroundColor: string;
  showFollowersCount?: boolean;
  showNewPostsCount?: boolean;
  links?: ElementLinks;
}

export interface CommunityHubHeaderCard extends TagTimelineObject {
  headerImage: string;
  headerImageWidth: number | null;
  headerImageHeight: number | null;
}

export interface TagInfoRow extends TagTimelineObject {
  image: string;
  imageWidth: number;
  imageHeight: number;
}

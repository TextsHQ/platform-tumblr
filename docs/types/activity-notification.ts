import { ImageResponse } from 'types/img';
import { ProductImageUrls } from 'types/tumblrmart';

import { ApiFetchResponse } from './api-fetch';
import { APILinks } from './api-link';
import { PostType } from './posts';

import type {
  ActivityNotificationChallenge,
  ActivityNotificationEditor,
} from 'schemas/activity-notification';

export enum ActivityNotificationType { // eslint-disable-line no-restricted-syntax
  AppealVerdictDenied = 'appeal_verdict_denied',
  AppealVerdictGranted = 'appeal_verdict_granted',
  Ask = 'ask',
  AskAnswer = 'ask_answer',
  BackInTown = 'back_in_town',
  BlazeApproved = 'blaze_approved',
  BlazeCompleted = 'blaze_completed',
  BlazeRejected = 'blaze_rejected',
  BlazeGoldenBuzzed = 'blaze_golden_buzzed',
  BlazeBlazeeCreated = 'blaze_blazee_created',
  BlazeBlazerCanceled = 'blaze_blazer_canceled',
  BlazeBlazeeCanceled = 'blaze_blazee_canceled',
  BlazeBlazerApproved = 'blaze_blazer_approved',
  BlazeBlazeeApproved = 'blaze_blazee_approved',
  BlazeBlazerGoldenBuzzed = 'blaze_blazer_golden_buzzed',
  BlazeBlazeeGoldenBuzzed = 'blaze_blazee_golden_buzzed',
  BlazeBlazerRejected = 'blaze_blazer_rejected',
  BlazeBlazeeRejected = 'blaze_blazee_rejected',
  BlazeBlazerExtinguished = 'blaze_blazer_extinguished',
  BlazeBlazeeExtinguished = 'blaze_blazee_extinguished',
  BlazeBlazerCompleted = 'blaze_blazer_completed',
  BlazeBlazeeCompleted = 'blaze_blazee_completed',
  PostCommunityLabelFlagged = 'post_community_label_flagged',
  PostCommunityLabelAccepted = 'post_community_label_accepted',
  PostCommunityLabelRejected = 'post_community_label_rejected',
  Conversational = 'conversational',
  ConversationalRollup = 'conversational_rollup',
  Follower = 'follower',
  FollowerRollup = 'follower_rollup',
  Gift = 'gift',
  GroupMember = 'group_member',
  Like = 'like',
  LikeRollup = 'like_rollup',
  LiveBroadcast = 'tmg_live_broadcast_start',
  MilestoneLike = 'milestone_like',
  MilestonePost = 'milestone_post',
  MilestoneBirthday = 'milestone_birthday',
  MilestoneLikeReceived = 'milestone_like_received',
  MilestoneReblogReceived = 'milestone_reblog_received',
  NoteMention = 'note_mention',
  PostAttribution = 'post_attribution',
  PostFlagged = 'post_flagged',
  PostingPrompt = 'posting_prompt',
  Reblog = 'reblog',
  ReblogNaked = 'reblog_naked',
  ReblogNakedRollup = 'reblog_naked_rollup',
  Reply = 'reply',
  SpamReported = 'spam_reported',
  Tip = 'tip',
  TipBlog = 'tip_blog',
  UserMention = 'user_mention',
  WhatYouMissed = 'what_you_missed',
  EarnedBadge = 'earned_badge',
}

const ACTIVITY_FILTERS = [
  'answered_ask',
  'ask',
  'back_in_town',
  'blaze_approved',
  'blaze_completed',
  'blaze_rejected',
  'blaze_golden_buzzed',
  'blaze_blazee_created',
  'blaze_blazer_canceled',
  'blaze_blazee_canceled',
  'blaze_blazer_approved',
  'blaze_blazee_approved',
  'blaze_blazer_golden_buzzed',
  'blaze_blazee_golden_buzzed',
  'blaze_blazer_rejected',
  'blaze_blazee_rejected',
  'blaze_blazer_extinguished',
  'blaze_blazee_extinguished',
  'blaze_blazer_completed',
  'blaze_blazee_completed',
  'post_community_label_flagged',
  'post_community_label_accepted',
  'post_community_label_rejected',
  'conversational_note',
  'follow',
  'gift',
  'like',
  'live_broadcast',
  'mention_in_post',
  'mention_in_reply',
  'milestone_like',
  'milestone_like_received',
  'milestone_post',
  'milestone_reblog_received',
  'milestone_birthday',
  'new_group_blog_member',
  'post_appeal_accepted',
  'post_appeal_rejected',
  'post_attribution',
  'post_flagged',
  'posting_prompt',
  'reblog_naked',
  'reblog_with_content',
  'reply',
  'rollups',
  'spam_reported',
  'tags',
  'tip',
  'tip_blog',
  'what_you_missed',
  'earned_badge',
] as const;

export type ActivityFilter = (typeof ACTIVITY_FILTERS)[number];

export const ALL_ACTIVITY_FILTERS: ReadonlySet<ActivityFilter> = new Set(ACTIVITY_FILTERS);

export type ActivityFilterSet = ReadonlySet<ActivityFilter>;

export enum PostAttributionType { // eslint-disable-line no-restricted-syntax
  GIF = 'gif',
  Image = 'image',
  None = 'none',
}

export interface ActivityRollupTumblelog {
  name: string;
  uuid: string;
  isAdult: boolean;
  fromTumblelogAvatars?: ImageResponse;
}

interface NotificationLink {
  details?: {
    href: string;
    method: string;
    queryParams: {
      from: string;
      to: string;
      postId: string | number;
    };
  };
  destination?: {
    href: string;
    method: string;
    type: string;
  };
}

export type ActivityNotificationResponse = ApiFetchResponse & {
  response: {
    notifications: ActivityNotification[];
    links?: APILinks;
  };
};

export interface ActivityNotification {
  action?: {
    label: string;
    url: string;
  };
  addedText?: string;
  avatar?: ProductImageUrls;
  before: number;
  diffToPrevious?: string;
  editor?: ActivityNotificationEditor;
  followed?: boolean;
  followingYou?: boolean;
  fromLiveNow?: boolean;
  fromTumblelogAvatars?: ImageResponse;
  fromTumblelogIsAdult?: boolean;
  fromTumblelogName?: string;
  fromTumblelogs?: ActivityRollupTumblelog[];
  fromTumblelogUuid?: string;
  id?: string;
  ids?: string[];
  isAnonymous?: boolean;
  isPrivate?: boolean;
  links?: NotificationLink;
  mediaUrl?: string;
  mediaUrlLarge?: string;
  milestone?: number;
  mutuals?: boolean;
  orderUuid?: string;
  postAttributionType?: PostAttributionType;
  postAttributionTypeName?: string;
  postId?: number;
  postTags?: string[];
  postType?: PostType;
  privateChannel?: boolean;
  productGroup?: string;
  prompt?: ActivityNotificationChallenge;
  reblogKey?: string;
  replyText?: string;
  rollupCount?: number;
  targetPostId: string;
  targetPostNsfwScore?: number;
  targetPostSummary?: string;
  targetPostType?: string;
  targetTumblelogName: string;
  targetTumblelogUuid: string;
  timestamp: number;
  tipAmount?: number;
  toTumblelogId?: string;
  type: ActivityNotificationType;
  unread: boolean;
}

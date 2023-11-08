import { Blog } from './blog';
import { CommunityLabelSetting, CommunityLabelSettings } from './community-labels';

export const USER_MINIMUM_AGE = 13;
export const USER_MAXIMUM_AGE = 130;

export default interface User { // eslint-disable-line import/no-default-export
  name: string;
  email?: string; // @TODO: Remove once #5382 is merged
  emailHash?: {
    md5?: string;
    sha256?: string;
    sha1?: string;
  };
  blogs: Blog[];
  bornYear?: number;
  age?: number;
  likes: number;
  following: number;
  defaultPostFormat?: string;
  safeSearch?: boolean;
  pushNotifications?: boolean;
  tourGuides?: {
    like: boolean;
    follow: boolean;
    reblog: boolean;
    compose: boolean;
    appearance: boolean;
    search: boolean;
  };
  notifications?: {
    push: {
      marketing: boolean;
      liveVideo: boolean;
    };
  };
  sounds?: {
    global: {
      web: boolean;
      // vv Do not use these, they're for the apps
      inApp?: boolean;
      pushNotification?: boolean;
    };
  };
  safeMode?: boolean;
  canModifySafeMode?: boolean;
  communityLabelVisibilitySetting?: string;
  oneid?: number;
  isPartial?: boolean;
  isPasswordless?: boolean;
  isEmailVerified?: boolean;
  showOnlineStatus?: boolean;
  conversationalNotifications?: boolean;
  communityLabelCategories?: CommunityLabelSettings;
  communityLabelSettings?: CommunityLabelSetting;
  hasTumblrPremium?: boolean;
  usedToHaveTumblrPremium?: boolean;
  hasTumblrFreePremium?: boolean;
  tumblrFreePremiumExpiration?: number;
  acceptedTippingTos?: boolean;
  viewWithBlogTheme?: boolean;
  userUuid?: string;
  canUseTumblrLive?: boolean;
  tumblrLiveReason?: 'needs_birthdate';
  unopenedGifts?: number;
  unopenedGiftLastRecipient?: string | null;
  hasDomains?: boolean;
  useNewWelcome?: boolean;
}

export interface UserBlog {
  name: string;
  url: string;
  updated: number;
  following: boolean;
  blog: Blog;
}

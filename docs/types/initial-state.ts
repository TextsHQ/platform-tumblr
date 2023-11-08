import { ImageResponse } from 'types/img';
import { ConfigRef } from 'types/logging';
import { LiveStreamingSettings } from 'utils/contexts/app-context';

import AnalyticsInfo from './analytics-info';
import { UserConfigRedpopInfo } from './api-fetch';
import BrowserInfo from './browser-info';
import { CommunityLabelSetting } from './community-labels';
import { LanguageCode } from './languages';
import AdPlacementConfiguration from './monetization/ad-placement-configuration';
import PrivacyKeys from './monetization/user-config-privacy';
import ReportingInfo from './reporting-info';
import RouteSet from './route-set';
import SessionInfo from './session-info';
import ViewportSize from './viewport-size';

import type { DehydratedState } from '@tanstack/react-query';

export const VIEWPORT_BOOTSTRAP_KEY = 'viewport-monitor';

interface BaseUserConfigTumblelog {
  url: string;
}
interface UserConfigTumblelog extends BaseUserConfigTumblelog {
  title?: string;
  avatar?: ImageResponse;
  updated?: number;
  firstPostTimestamp?: number;
  description?: string;
}

export interface GDPRDownloadRequest {
  isValid: boolean;
  isComplete: boolean;
  isPending: boolean;
  isInProgress: boolean;
  createdOn: string;
  downloadExpiry: string;
  downloadExpired: boolean;
  statusMessage: string;
  downloadUrl: string;
  transactionId: string;
}

interface GDPR {
  isGDPRScope: boolean;
  flurryConsentRecord?: string;
  downloadRequests: GDPRDownloadRequest[];
  tcfv2Consent?: { 'x-tumblr-analyticsConsent'?: boolean };
}

export interface UserConfigBase {
  features: { [Key: string]: boolean };
  experiments?: { [Key: string]: string };
  adPlacementConfiguration?: AdPlacementConfiguration;
  privacy?: PrivacyKeys;

  // The following attributes are currently NOT USED by our app, but they are being
  // sent by the backend and it'd be disingenuous to not list them here.
  gdpr?: GDPR;
  labs?: { [Key: string]: boolean };
  liveStreaming?: LiveStreamingSettings;
  oneMobileDCN?: string;
  safeMode?: boolean;
  /**
   * True if adult, false if underage or in geographic area with safe mode always enabled.
   * @see https://github.tumblr.net/Tumblr/tumblr/blob/93036a7e8f98090ec1028f62364337310d83becc/app/models/user.php#L8726
   */
  canModifySafeMode?: boolean;
}

export interface UserConfig extends UserConfigBase, UserConfigRedpopInfo {
  headers: { [Key: string]: string | number };
  configRef?: ConfigRef;
  tumblelog?: UserConfigTumblelog;
}

export interface InitialState extends InitialStateAppLocals {
  chunkNames: string[];
  cookieBootstrap?: any;
  routeSet?: RouteSet;
  isServerError?: boolean;
  routeUsesPalette?: boolean;
  routeHidesLowerRightContent?: boolean;
  routeName?: string;
  tumblelog?: BaseUserConfigTumblelog | UserConfigTumblelog;
  isLoggedIn?: {
    isLoggedIn: boolean;
    isPartiallyRegistered?: boolean;
    isAdmin?: boolean;
  };
  isInitialRequestPeepr?: boolean;
  isInitialRequestSSRModal?: boolean;
  queries: DehydratedState;
  recaptchaV3PublicKey?: { value: string };
  vapidPublicKey?: { value: string };
  tmgliveStagingWebPaymentsCredentials?: { value: string };
  obfuscatedFeatures?: string;
  supportedBrowserRegexp?: RegExp;
  [VIEWPORT_BOOTSTRAP_KEY]?: ViewportSize;
  [bootstrapKey: string]: any;
  responseHttpStatus?: number;
}

export interface LanguageData {
  code: LanguageCode;
  data: any;
  timeZone?: string;
}

export interface InitialStateAppLocals extends InitialStateToRedpopContainer {
  reportingInfo?: ReportingInfo;

  apiFetchStore?: { [Key: string]: string };
  apiUrl?: string;
  cspNonce?: string;
  csrfToken?: string;

  wwwBaseUrl?: string;
  cssMapUrl?: string;

  languageData?: LanguageData;

  // For password-protected blogs on the blog network
  tumblelogAuthToken?: string;

  liveStreaming?: LiveStreamingSettings;
}

/**
 * Some of our appLocals & initial state variables just get passed right on through to our <RedpopContainer />.
 * Rather than redefining it over and over, we consolidate this core interface for easier reference/extension.
 */
export interface InitialStateToRedpopContainer {
  browserInfo?: BrowserInfo;
  sessionInfo?: SessionInfo;
  analyticsInfo?: AnalyticsInfo;
  adPlacementConfiguration?: AdPlacementConfiguration;
  configRef?: ConfigRef;
  privacy?: PrivacyKeys;
  endlessScrollingDisabled?: boolean;
  bestStuffFirstDisabled?: boolean;
  colorizedTags?: boolean;
  autoTruncatingPosts?: boolean;
  timestamps?: boolean;
  communityLabelVisibilitySetting?: CommunityLabelSetting;
  labsSettings?: Record<string, boolean | undefined>;
  randomNumber?: number;
  isFollowingTabOnPage?: boolean;
}

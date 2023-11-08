interface SetCookieOptions {
  expires?: Date | null;
  path?: string | null;
  secure?: boolean | null;
  domain?: string | null;
  maxAge?: number | null;
}

export type GetCookieFunction = (key: string) => string;

export type SetCookieFunction = (
  key: string,
  value: string,
  givenOptions?: SetCookieOptions,
) => void;

export interface CookieFunctions {
  getCookie: GetCookieFunction;
  setCookie: SetCookieFunction;
}

export const COOKIE_VALUE_TRUE = '1';
export const COOKIE_VALUE_FALSE = '0';

export const THIRD_PARTY_ID_TOKEN_COOKIE = 'snacc';
export const THIRD_PARTY_EMAIL = '3pa-email';

export enum RedpopCookie { // eslint-disable-line no-restricted-syntax
  MAIN_SETTING = 'redpop',
  EXPERIMENT = 'redpop_experiment',
  SID = 'sid',
  EDITOR_BETA_TOGGLED = 'redpop-editor-beta-toggled',
  EDITOR_GUTENBERG_TOGGLED = 'redpop-editor-gutenberg-toggle',
  SIGN_UP_CTA_DISMISSED = 'sign-up-cta-dismissed',
  EXPLORE_TAGS_EMPTY_CTA_DISMISSED = 'explore-tags-empty-cta-dismissed',
  COPPA_REGISTRATION_BLOCKED = 'cregb',
  BLAZE_DISPLAY_MODE = 'blaze-displayMode',
  TAGGED_DISPLAY_MODE = 'tagged-displayMode',
  LIKES_DISPLAY_MODE = 'likes-displayMode',
  SEARCH_DISPLAY_MODE = 'search-displayMode',
  COLLECTIONS_DISPLAY_MODE = 'collections-displayMode',
  ACTIVITY_GRAPH = 'activity',
  ACTIVITY_FILTER = 'activity-filter',
  BLOG_VIEW_TIMELINE_DISPLAY_MODE = 'blog-view-timeline-display-mode',
  LOGGED_IN = 'logged_in',
  NATIVE_APP_WEBVIEW = 'app',
  SHARE_LINK_REFERRAL = 'redpop-share-link-referral',
  FORCE_COMPLETE_ONBOARDING = 'force-complete-onboarding',
}

export const NativeAppWebviewCookieValues = ['iphone', 'android'];
export type NativeAppWebviewCookieValue = typeof NativeAppWebviewCookieValues[number];

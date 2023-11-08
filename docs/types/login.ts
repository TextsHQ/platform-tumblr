import { type OnboardingState } from 'components/onboarding-2022/utils';
import type { FC, ReactNode } from 'react';
import type { FormToShow } from './landing-page';

export interface LoginWallBlogNetworkProps {
  host: string;
  blogName: string;
  postId?: string;
}

export interface LoginWallProps {
  text?: string | FC;
  title: string | FC;
  form: FormToShow;
  footer?: ReactNode;
  registerUsernamePlaceholder?: string;
  options?: {
    glassOverlay?: boolean;
    smallTitle?: boolean;
    isDismissible?: boolean;
    blogNetwork?: LoginWallBlogNetworkProps;
    hideLogo?: boolean;
  };
  experiments?: { [key: string]: any };
  collectionFlow?: OnboardingState['collectionFlow'];
}

export interface LogInOptions {
  email: string;
  captchaToken: string | undefined;
  password: string;
  tfaToken: string | undefined;
}

export interface LoginQueryParams {
  redirect_to?: string;
  referring_blog?: string;
  follow_blog?: string;
  follow_tag?: string;
  referer_query?: string;
  // note that the "source" could be from the RegisterSources enum,
  // but also could be other things passed from the server, so we can't limit to just that enum
  source?: string;
  verifiedBlogname?: string;
  utm_campaign?: string;
  utm_source?: string;
  utm_medium?: string;
}

export type LoginError =
  | 'EmailEmpty'
  | 'InputsEmpty'
  | 'MalformedEmail'
  | 'PasswordEmpty'
  | 'PasswordMismatch'
  | 'PasswordLength'
  | 'PasswordMaxLength'
  | 'PasswordMaxByteLength'
  | 'InvalidAge'
  | 'PasswordFail'
  | 'ResetRequired'
  | 'TfaFail'
  | 'TfaRequired'
  | 'RegistrationBlocked'
  | 'EmailUnavailable'
  | 'BlognameInvalid'
  | 'BlognameUnavailable'
  | 'PasswordInvalid'
  | 'RecaptchaExpired'
  | 'Unknown';

export type RegisterSources =
  | 'blog_follow'
  | 'collections'
  | 'homepage_explore'
  | 'homepage_explore_blog_follow'
  | 'hubs_floating_sign_up'
  | 'hubs_main_follow'
  | 'hubs_related_tags_follow'
  | 'hubs_header_sign_up'
  | 'hubs_top_blog_follow'
  | 'hubs_blog_follow'
  | 'search_blog_follow'
  | 'search_main_follow'
  | 'search_header_sign_up'
  | 'search_floating_sign_up'
  | 'explore_header_sign_up'
  | 'explore_floating_sign_up'
  | 'explore_right_rail_sign_up'
  | 'archive_floating_sign_up'
  | 'explore_trending_blog_follow'
  | 'explore_blog_follow'
  | 'login_register_header'
  | 'login_register_header_mobile'
  | 'login_register_center'
  | 'login_register_required'
  | 'login_wall'
  | 'archive_login_wall'
  | 'blog_view_login_wall'
  | 'blog_view_floating_sign_up'
  | 'blog_peepr_view_login_wall'
  | 'search_login_wall'
  | 'explore_login_wall'
  | 'hubs_login_wall'
  | 'blog_peepr_view_floating_sign_up'
  | 'blog_peepr_view_right_rail_sign_up'
  | 'email_not_used_yet'
  | 'image_media_header'
  | 'new_to_tumblr'
  | 'unknown'
  | 'content_warning_wall'
  | 'twitter_landing_page';

// these are potential components that could provide a link to sign up for Tumblr
// if you add something here, try to make sure to map it out in the findRegistrationSource function
export type RegisterComponents = 'blog_follow_button' | 'tag_follow_button' | 'register_button';

export interface SuggestedBlogNamesResponse {
  response?: {
    suggestedRandomNames?: string[];
  };
}

import type { PageNameForPostFormEntryPoint } from 'schemas/logging';
import type { CollectionsEventType } from 'src/labs/types/collections';
import type { CommunitiesEventType } from 'src/labs/types/communities';
import type { SupplyProviderId } from 'types/monetization/supply-provider-id';
import type RouteSet from 'types/route-set';
import type { AdvertisementType } from './advertisement-type';
import type {
  AdUserSyncEventType,
  DemandClientEventType,
  MediationAnalyticsEventType,
  SupplyClientEventType,
} from './monetization';
import type { VideoAnalyticsExternalEvent } from './monetization/video-viewability';

export interface KrakenLogger {
  logEvent: LogEvent;
  logPerformanceMetric: (metric: PerformanceInfo) => void;
  logImpression: LogImpression;
}

export const enum KrakenEvent { // eslint-disable-line no-restricted-syntax
  BlogNameClick = 'BlogNameClick',
  ReblogNameClick = 'ReblogNameClick',
  BlogTitle = 'blog_title',
  BlocksBlockAdded = 'blocks:block_added',
  BlocksBlockAddedBlockAlreadyExists = 'blocks:block_added:block_already_exists',
  BlocksBlockRemoved = 'blocks:block_removed',
  BlocksBlocklistMoreLoaded = 'blocks:blocklist:more_loaded',
  BlocksBlocklistOpened = 'blocks:blocklist:opened',
  CarouselSlide = 'carousel_slide',
  CnameDisabled = 'cname:disabled',
  CnameEnabled = 'cname:enabled',
  CustomThemeDisabled = 'customTheme:disabled',
  CustomThemeEnabled = 'customTheme:enabled',
  Impression = 'impression',
  TimeSpentOnSite = 'TimeSpentOnSite',
  ImageContextClick = 'ImageContextClick',
  ColorPaletteToggled = 'ColorPaletteToggled',
  ColorPaletteSelected = 'ColorPaletteSelected',
  ThirdPartyExtensionCSSMapRequest = 'ThirdPartyExtensions:CssMapRequest',
  ThirdPartyExtensionCSSMapFailure = 'ThirdPartyExtensions:CssMapFailure',
  AppDownloadClick = 'app_download_click',
  AppOpenClick = 'app_open_click',
  HubsUndefinedSort = 'HubsUndefinedSort',
  NewPostIndicatorShow = 'NewPostIndicatorShow',
  NewPostIndicatorHide = 'NewPostIndicatorHide',
  NewPostIndicatorTap = 'NewPostIndicatorTap',
  RestoreTimelineIndicatorShow = 'RestoreTimelineIndicatorShow',
  RestoreTimelineIndicatorHide = 'RestoreTimelineIndicatorHide',
  RestoreTimelineIndicatorTap = 'RestoreTimelineIndicatorTap',
  RestoreTimelineIndicatorRefreshTap = 'RestoreTimelineIndicatorRefreshTap',
  CDNMediaPageClickLogo = 'CDNMediaPageClick:Logo',
  CDNMediaPageClickExplore = 'CDNMediaPageClick:Explore',
  LastBluespaceLocationUndefined = 'LastBluespaceLocationUndefined',
  // Login Wall
  LoginWallOpen = 'LoginWallOpen',
  LoginWallLike = 'LoginWallLike',
  LoginWallFollow = 'LoginWallFollow',
  LoginWallReblog = 'LoginWallReblog',
  LoginWallNotes = 'LoginWallNotes',
  LoginWallTags = 'LoginWallTags',
  LoginWallFollowTag = 'LoginWallFollowTag',
  LoginWallNewTaggedPost = 'LoginWallNewTaggedPost',
  LoginWallBlogView = 'LoginWallBlogView',
  LoginWallScroll = 'LoginWallScroll',
  LoginWallPeeprViewScroll = 'LoginWallPeeprViewScroll',
  LoginWallArchivePost = 'LoginWallArchivePost',
  LoginWallArchiveFilter = 'LoginWallArchiveFilter',
  LoginWallClickCounter = 'LoginWallClickCounter',
  LoginWallAsk = 'LoginWallAsk',
  LoginWallCheckmark = 'LoginWallCheckmark',
  LoginSuccess = 'LoginSuccess',

  ClickLogin = 'ClickLogin',
  ClickSignup = 'ClickSignup',
  SignUpCTAClickDismiss = 'SignUpCTAClickDismiss',
  SignUpCTAClickRegister = 'SignUpCTAClickRegister',
  LoginCTAClick = 'LoginCTAClick',
  BannerSignUpCTAShown = 'BannerSignUpCTAShown',
  GroupChatLandingPageCardClick = 'group_chat_landing_page_card_click',
  UnsupportedBrowserMessageView = 'UnsupportedBrowserMessageView',
  UnsupportedBrowserMessageDismiss = 'UnsupportedBrowserMessageDismiss',
  BannerActionClick = 'BannerActionClick',
  TimelineDisplayModeToggleGrid = 'TimelineDisplayModeToggleGrid',
  TimelineDisplayModeToggleList = 'TimelineDisplayModeToggleList',
  TimelineDisplayModeToggleMasonry = 'TimelineDisplayModeToggleMasonry',
  TimelineDisplayModeToggleEmbed = 'TimelineDisplayModeToggleEmbed',
  SendAPostClick = 'SendAPostClick',
  SendAPostSelected = 'SendAPostSelected',
  ShareDestination = 'ShareDestination',
  ShowMoreBlogs = 'ShowMoreBlogs',
  FeatureExposed = 'feature_exposed',
  Like = 'like',
  Unlike = 'unlike',
  DeletePost = 'DeletePost',
  Mute = 'MutePost',
  MuteHours = 'MutePostHours',
  MuteDay = 'MutePostDay',
  MuteWeek = 'MutePostWeek',
  MuteForever = 'MuteForever',
  Unmute = 'UnmutePost',
  UnmuteFromHeader = 'UnmutePostFromHeader',
  ClientLike = 'client_like',
  ReplyIconClick = 'reply_icon_click',
  Notes = 'notes',
  Follow = 'follow',
  Unfollow = 'unfollow',
  Share = 'share',
  ViewableImpression = 'viewable_impression',
  ViewPost = 'view_post',
  EditFailed = 'EditFailed',
  PostFailed = 'PostFailed',
  ReblogFailed = 'ReblogFailed',
  Reblog = 'reblog',
  ClientReblog = 'client_reblog',
  EditSuccess = 'EditSuccess',
  PostFormsIframeError = 'PostFormsIframeError',
  PostSuccess = 'PostSuccess',
  AskCTA = 'AskCTA',
  PFAsk = 'PFAsk',
  PFNewBlock = 'PFNewBlock',
  PFAlertBlockLimit = 'PFAlertBlockLimit',
  PFAddLink = 'PFAddLink',
  PFAddLinkCardError = 'PFAddLinkCardError',
  PFSelectMedia = 'PFSelectMedia',
  PFAddMedia = 'PFAddMedia',
  PFDismiss = 'PFDismiss',
  PFGifSearch = 'PFGifSearch',
  PFGifSearchSelect = 'PFGifSearchSelect',
  PFDragBlock = 'PFDragBlock',
  PFEditAttempt = 'PFEditAttempt',
  PFTextStyleParagraph = 'PFTextStyleParagraph',
  PFTextStyleHeading1 = 'PFTextStyleHeading1',
  PFTextStyleHeading2 = 'PFTextStyleHeading2',
  PFTextStyleQuote = 'PFTextStyleQuote',
  PFTextStyleChat = 'PFTextStyleChat',
  PFTextStyleQuirky = 'PFTextStyleQuirky',
  PFTextStyleUnorderedList = 'PFTextStyleUnorderedList',
  PFTextStyleOrderedList = 'PFTextStyleOrderedList',
  PFTextStyleIndented = 'PFTextStyleIndented',
  PFBlogSelect = 'PFBlogSelect',
  PFPostAttempt = 'PFPostAttempt',
  PFComposePost = 'PFComposePost', // New post pencil
  PFComposePostText = 'PFComposePost:text',
  PFComposePostAudio = 'PFComposePost:audio',
  PFComposePostPhoto = 'PFComposePost:photo',
  PFComposePostQuote = 'PFComposePost:quote',
  PFComposePostLink = 'PFComposePost:link',
  PFComposePostChat = 'PFComposePost:chat',
  PFComposePostVideo = 'PFComposePost:video',
  PFDeleteBlock = 'PFDeleteBlock',
  PFTextBold = 'PFTextBold',
  PFTextItalic = 'PFTextItalic',
  PFTextStrike = 'PFTextStrike',
  PFTextSmall = 'PFTextSmall',
  PFTextRed = 'PFTextRed',
  PFTextOrange = 'PFTextOrange',
  PFTextYellow = 'PFTextYellow',
  PFTextGreen = 'PFTextGreen',
  PFTextBlue = 'PFTextBlue',
  PFTextBlack = 'PFTextBlack',
  PFTextPink = 'PFTextPink',
  PFTextPurple = 'PFTextPurple',
  PFInlineLink = 'PFInlineLink',
  PFTagAdd = 'PFTagAdd',
  PFTagRemove = 'PFTagRemove',
  PFOpenCanvas = 'PFOpenCanvas',
  PFOptionsCog = 'PFOptionsCog',
  PFOptionsDraft = 'PFOptionsDraft',
  PFOptionsSchedule = 'PFOptionsSchedule',
  PFOptionsPrivate = 'PFOptionsPrivate',
  PFBetaDefaultSwitchON = 'PFBetaDefaultSwitchON',
  PFBetaDefaultSwitchOFF = 'PFBetaDefaultSwitchOFF',
  PFBetaSwitchON = 'PFBetaSwitchON',
  PFBetaSwitchONConfirm = 'PFBetaSwitchONConfirm',
  PFBetaSwitchONDismiss = 'PFBetaSwitchONDismiss',
  PFBetaSwitchOFF = 'PFBetaSwitchOFF',
  PFBetaSwitchOFFConfirm = 'PFBetaSwitchOFFConfirm',
  PFBetaSwitchOFFDismiss = 'PFBetaSwitchOFFDismiss',
  PFBetaSwitchHelp = 'PFBetaSwitchHelp',
  PFOptionsQueue = 'PFOptionsQueue',
  PFOptionsNow = 'PFOptionsNow',
  PFOptionsHubOnly = 'PFOptionsHubOnly',
  PFPostOptionOpen = 'PFPostOptionOpen',
  PFReblogAttempt = 'PFReblogAttempt',
  PostRibbonAvatarClick = 'PostRibbonAvatarClick',
  ScreenView = 'ScreenView',
  LegacyScreenView = 'LegacyScreenView',
  MRECInitialize = 'MREC:initialize',
  HydraConfigLoaded = 'hydra_config_loaded',
  SearchPSAShown = 'SearchPSAShown',
  SearchResultsClearFiltersCtaTap = 'SearchResultsClearFiltersCtaTap',
  SearchResultsFilterChange = 'SearchResultsFilterChange',
  SearchResultsTagElementTap = 'SearchResultsTagElementTap',
  TagRibbonTagTap = 'TagRibbonTagTap',
  HeaderTapped = 'HeaderTapped',
  Photo = 'photo',
  PhotoClickThrough = 'photo_click_through',
  PinPost = 'PinPost',
  PinPostConfirm = 'PinPostConfirm',
  PinPostCancel = 'PinPostCancel',
  UnpinPost = 'UnpinPost',
  ClickedOnTagCard = 'ClickedOnTagCard',
  FollowTagsModal = 'FollowTagsModal',
  ManageTagsModal = 'ManageTagsModal',
  FollowedTagClick = 'FollowedTagClick',
  Pagination = 'Pagination',
  CTAButton = 'cta_button',
  CTAClick = 'action_click',
  ClickThrough = 'click_thru',
  VideoClickThrough = 'video_click_through',
  Click = 'click',
  WrittenUrlClickThrough = 'written_url_click_through',
  Permalink = 'Permalink',
  Posts = 'posts',
  Avatar = 'avatar',
  CopyPostLink = 'CopyPostLink',
  CopyEmbedPostCode = 'CopyEmbedPostCode',
  Hyperlink = 'caption',
  HyperlinkedImage = 'hyperlinked_image',
  BlogCardShown = 'BlogCardShown',
  TimeLineCTAClick = 'TimeLineCTAClick',
  LogoClick = 'LogoClick',
  ActivityFilterSelected = 'ActivityFilterSelected',
  FastReblogOld = 'FastReblogOld',
  FastReblog = 'FastReblog',
  FastQueue = 'FastQueue',
  BlogHeaderLinkClick = 'BlogHeaderLinkClick',
  BlogAvatarLinkClick = 'BlogAvatarLinkClick',
  BlogHeaderNetworkLinkClick = 'BlogHeaderNetworkLinkClick',
  BlogTitleLinkClick = 'BlogTitleLinkClick',
  BlogDescriptionLinkClick = 'BlogDescriptionLinkClick',
  PeeprSearchOpen = 'PeeprSearchOpen',
  PeeprSearchClosed = 'PeeprSearchClosed',
  PeeprBlogSubscribe = 'PeeprBlogSubscribe',
  PeeprBlogUnsubscribe = 'PeeprBlogUnsubscribe',
  DropDownItemClick = 'DropDownItemClick',
  BlogArchiveClick = 'BlogArchiveClick',
  BlogMessageClick = 'BlogMessageClick', // within the blog meatball dropdown
  BlogMessageIconClick = 'BlogMessageIconClick', // the actual icon in the blog header
  BlogFollowingClick = 'BlogFollowingClick',
  BlogAskClick = 'BlogAskClick',
  BlogSubmitClick = 'BlogSubmitClick',
  BlogReportClick = 'BlogReportClick',
  BlogUnblockClick = 'BlogUnblockClick',
  BlogBlockClick = 'BlogBlockClick',
  BlogUrlClick = 'BlogUrlClick',
  BlogShareClick = 'BlogShareClick',
  BlogShareToFacebookClick = 'BlogShareToFacebookClick',
  BlogShareToTwitterClick = 'BlogShareToTwitterClick',
  VideoPlay = 'video_play',
  VideoAutoPlay = 'video_auto_play',
  VideoStop = 'video_stop',
  VideoEnd = 'video_end',
  DockElement = 'dock_element',
  UndockElement = 'undock_element',
  AuthenticationStepShown = 'AuthenticationStepShown',
  GoogleAdFilled = 'GoogleAdFilled',
  GoogleRewardedAdFilled = 'GoogleRewardedAdFilled',
  GoogleRewardedAdUnfilled = 'GoogleRewardedAdUnfilled',
  PrebidAdFilled = 'PrebidAdFilled',
  PrebidAdUnfilled = 'PrebidAdUnfilled',
  RewardedAdButtonClicked = 'AdFreeBrowsingRewardedAdButtonClick',
  RewardedAdFailed = 'AdFreeBrowsingRewardedAdFailedToRender',
  RewardedAdClosed = 'AdFreeBrowsingRewardSkipped',
  RewardedAdGranted = 'AdFreeBrowsingRewardEarned',
  RewardedAdButtonVisible = 'AdFreeBrowsingRewardedAdButtonVisible',
  RewardedAdPushNotificationClick = 'AdFreeBrowsingPushNotificationClick',
  GoogleRegisterClick = 'GoogleRegisterClick',
  GoogleLoginClick = 'GoogleLoginClick',
  GoogleCompleteRegistrationClick = 'GoogleCompleteRegistrationClick',
  GoogleLinkAccountRedirect = 'GoogleLinkAccountRedirect',
  GoogleLinkAccountClick = 'GoogleLinkAccountClick',
  GoogleLoginTfaRedirect = 'GoogleLoginTfaRedirect',
  HideAd = 'hide_ad',
  ReportAd = 'report_ad',
  AppleRegisterClick = 'AppleRegisterClick',
  AppleLoginClick = 'AppleLoginClick',
  AppleCompleteRegistrationClick = 'AppleCompleteRegistrationClick',
  AppleLinkAccountRedirect = 'AppleLinkAccountRedirect',
  AppleLinkAccountClick = 'AppleLinkAccountClick',
  AppleLoginTfaRedirect = 'AppleLoginTfaRedirect',
  AccountPopover = 'AccountPopover',
  CommunitiesPopover = 'CommunitiesPopover',
  ActivityPopover = 'ActivityPopover',
  LoggedOutLandingBlogClick = 'LoggedOutLandingBlogClick',
  LoggedOutLandingAvatarClick = 'LoggedOutLandingAvatarClick',
  LoggedOutLandingArtistClick = 'LoggedOutLandingArtistClick',
  LoggedOutBlogViewModalScroll = 'LoggedOutBlogViewModalScroll',
  MessagesPopover = 'MessagesPopover',
  MessagesPopoverNewMessage = 'MessagesPopoverNewMessage',
  MessagesPopoverSwitchBlog = 'MessagesPopoverSwitchBlog',
  PostpActivate = 'PostpActivate',
  PostpDeactivateConfirm = 'PostpDeactivateConfirm',
  PostpDeactivateTap = 'PostpDeactivateTap',
  PostpPayment = 'PostpPayment',
  PostpReactivate = 'PostpReactivate',
  PostpSetupProfilePerkAddTap = 'PostpSetupProfilePerkAddTap',
  PostpSetupProfilePerkLimitReached = 'PostpSetupProfilePerkLimitReached',
  PostpSetupProfilePerkOpen = 'PostpSetupProfilePerkOpen',
  PostpSetupProfilePerkSaveTap = 'PostpSetupProfilePerkSaveTap',
  PostpSettingsTap = 'PostpSettingsTap',
  PostpSetupKycTap = 'PostpSetupKycTap',
  PostpSetupPriceSaveTap = 'PostpSetupPriceSaveTap',
  PostpSetupPriceSelected = 'PostpSetupPriceSelected',
  PostpSetupPriceTap = 'PostpSetupPriceTap',
  PostpSetupProfileSaveTap = 'PostpSetupProfileSaveTap',
  PostpSetupProfileTap = 'PostpSetupProfileTap',
  PostpSetupProfileViewTap = 'PostpSetupProfileViewTap',
  PostpSetVisibility = 'PostpSetVisibility',
  PostpStripeDashboardTap = 'PostpStripeDashboardTap',
  PostpSetupBannerTap = 'PostpSetupBannerTap',
  PostpSubscribeTap = 'PostpSubscribeTap',
  PostpSupportTap = 'PostpSupportTap',
  PostpPaymentMethodTap = 'PostpPaymentMethodTap',
  PostpPaymentMethodDone = 'PostpPaymentMethodDone',
  PostHeaderClick = 'PostHeaderClick',
  ReblogHeaderClick = 'ReblogHeaderClick',
  AdFreeBrowsingGiveGiftClick = 'AdFreeBrowsingGiveGiftClick',
  AdFreeLinkClick = 'adMeatballs:goAdsFreeSelected',
  AdFreeBrowsingPerksScreenShown = 'AdFreeBrowsingPerksScreenShown',
  AdFreeBrowsingSubscriptionManagementScreenShown =
    'AdFreeBrowsingSubscriptionManagementScreenShown',
  AdFreeBrowsingPurchaseTap = 'AdFreeBrowsingPurchaseTap',
  AdFreeBrowsingPurchaseDone = 'AdFreeBrowsingPurchaseDone',
  AdFreeBrowsingCancelTap = 'AdFreeBrowsingCancelTap',
  AdFreeBrowsingCancelConfirm = 'AdFreeBrowsingCancelConfirm',
  AdFreeBrowsingResubscribe = 'AdFreeBrowsingResubscribe',
  AdFreeBrowsingPaymentMethodTap = 'AdFreeBrowsingPaymentMethodTap',
  AdFreeBrowsingPaymentMethodDone = 'AdFreeBrowsingPaymentMethodDone',
  AdFreeBrowsingOnHoldView = 'AdFreeBrowsingOnHoldView',
  AdFreeBrowsingInvalidPaymentView = 'AdFreeBrowsingInvalidPaymentView',
  AdFreeBrowsingRightRailAdClick = 'AdFreeBrowsingRightRailAdClick',
  AdFreeBrowsingTspAdClick = 'AdFreeBrowsingTspAdClick',
  AdFreeBrowsingInStreamAdClick = 'AdFreeBrowsingInStreamAdClick',
  AdFreeBrowsingTsdClick = 'AdFreeBrowsingTsdClick',
  AdFreeBrowsingStaffPostClick = 'AdFreeBrowsingStaffPostClick',
  AdFreeBrowsingSettingsClick = 'AdFreeBrowsingSettingsClick',
  AdFreeBrowsingTrendingBlogsMailClick = 'AdFreeBrowsingTrendingBlogsMailClick',
  AdFreeBrowsingResubscribeMailClick = 'AdFreeBrowsingResubscribeMailClick',
  AdFreeBrowsingTumblrbotCampaignClick = 'AdFreeBrowsingTumblrbotCampaignClick',
  AdFreeBrowsingGiveGiftSelect = 'AdFreeBrowsingGiveGiftSelect',
  AdFreeBrowsingGiveGiftThanks = 'AdFreeBrowsingGiveGiftThanks',
  AdFreeBrowsingReceiveGiftClick = 'AdFreeBrowsingReceiveGiftClick',
  AdFreeBrowsingReceiveGiftShare = 'AdFreeBrowsingReceiveGiftShare',
  AdFreeBrowsingReceiveGiftReply = 'AdFreeBrowsingReceiveGiftReply',
  AdFreeBrowsingReceiveGiftEnjoy = 'AdFreeBrowsingReceiveGiftEnjoy',
  AdFreeBrowsingReceiveGiftSettings = 'AdFreeBrowsingReceiveGiftSettings',
  AdFreeBrowsingSettingsShowNone = 'AdFreeBrowsingSettingsShowNone',
  AdFreeBrowsingSettingsShowBlaze = 'AdFreeBrowsingSettingsShowBlaze',
  AdFreeBrowsingSettingsShowAll = 'AdFreeBrowsingSettingsShowAll',
  PostActivityDisplayMode = 'PostNotesActivityMode',
  PostActivityTimeSpent = 'PostNotesActivityTimeSpent',
  PostActivityTabSelectReplies = 'notes_tab_replies_selected',
  PostActivityTabSelectReblogs = 'notes_tab_reblogs_selected',
  PostActivityTabSelectReblogGraph = 'notes_tab_rebloggraph_selected',
  PostActivityTabSelectLikes = 'notes_tab_likes_selected',
  PostActivityReplyBarAvatarClick = 'notesScreen:replyBarAvatarClick',
  PostActivityOpenReplyBlogSelector = 'notesScreen:avatarButtonTapped',
  PostActivitySendReply = 'notesScreen:replySendButtonTapped',
  PostActivityFetchMoreNotes = 'NotesMore',
  PostActivityReblogFilterSelectWithContentComments =
    'notes_reblogs_with_content_comments_filter_selected',
  PostActivityReblogFilterSelectWithComments = 'notes_reblogs_with_comments_filter_selected',
  PostActivityReblogFilterSelectOther = 'notes_reblogs_only_filter_selected',
  PostActivityReplySortDirectionChange = 'notes_reply_sort_option_selected',
  PostActivityNoteClickBlogName = 'notes_username_tapped',
  PostActivityNoteClickReblog = 'notesScreenActionSheet:reblogTapped',
  PostActivityNoteClickFollow = 'notes_follow_button_tapped',
  PostActivityNoteClickExpand = 'notes_see_more_tapped',
  PostActivityNoteReport = 'notesScreenActionSheet:reportTapped',
  PostActivityNoteBlock = 'notesScreenActionSheet:blockTapped',
  PostActivityNoteDelete = 'notesScreenActionSheet:deleteTapped',
  PostActivityNoteHide = 'notesScreenActionSheet:hideTapped',
  PostActivitySubscribe = 'conversationalNoteSubscribeButton',
  PostMeatballsMenuOpened = 'PostHeaderMeatballsClicked',
  YIRLandingPageError = 'YIRLandingPageError',
  YIRLandingPageTryAgainError = 'YIRLandingPageTryAgainError',
  YIRLandingPageGiveMeClick = 'YIRLandingPageGiveMeClick',
  YIRLandingPageChangeBlog = 'YIRLandingPageChangeBlog',
  YIRLoadingPageShowMeClick = 'YIRLoadingPageShowMeClick',
  YIRResultsPageHeaderShareClick = 'YIRResultsPageHeaderShareClick',
  YIRResultsPageFooterShareClick = 'YIRResultsPageFooterShareClick',
  TipPostToggle = 'tip_post_toggle',
  TipPostTap = 'tip_post_tap',
  StartTippingTap = 'start_tipping_tap',
  TipPaymentSuccess = 'tip_payment_success',
  NotificationClick = 'NotificationClick',
  AdultContentAppealOpenExplicit = 'ReviewExplicitClick',
  AdultContentAppealOpenSensitive = 'ReviewSensitiveClick',
  AdultContentAppealNext = 'adult_content_appeal_next_tapped',
  AdultContentAppealCancel = 'adult_content_appeal_nevermind_tapped',
  AdultContentAppealSubmitExplicit = 'RequestReviewExplicit',
  AdultContentAppealSubmitSensitive = 'RequestReviewSensitive',
  VideoHubCardTapped = 'VideoHubCardTapped',
  VideoHubItemShown = 'VideoHubItemShown',
  VideoHubGifsetViewed = 'VideoHubGifsetViewed',
  ScreenLeft = 'ScreenLeft',
  VideoHubSecondsInStream = 'VideoHubSecondsInStream',
  VideoHubPlayerPagination = 'VideoHubPlayer_pagination',
  EditorModeChange = 'EditorModeChange',
  PayoutsTap = 'payouts_tap',
  TippingOnboardingStart = 'tipping_onboarding_start',
  TippingToggleOn = 'tipping_toggle_on',
  StripeEditTap = 'stripe_edit_tap',
  BlazePromoPageComposePost = 'BlazePromoPageComposePost',
  StrangerThingsOverlayEnabled = 'StrangerThingsOverlayEnabled',
  StrangerThingsOverlayDisabled = 'StrangerThingsOverlayDisabled',
  ReblogIconClick = 'ReblogIconClick',
  Dismissed = 'Dismissed',
  Shown = 'Shown',
  CustomizeClicked = 'CustomizeClicked',
  CelebrationCTAClicked = 'CelebrationCTAClicked',
  CrabShareFarewell = 'CrabShareFarewell',
  HorseFriendShareFarewell = 'HorseFriendShareFarewell',
  HorseFriendGiveGiftSelect = 'HorseFriendGiveGiftSelect',
  HorseFriendHatched = 'HorseFriendHatched',
  HorseFriendScoreboardShare = 'HorseFriendScoreboardShare',
  HorseFriendWindowOpened = 'HorseFriendWindowOpened',
  CrabsGiveGiftSelect = 'CrabsGiveGiftSelect',
  CrabsScoreboardShare = 'CrabsScoreboardShare',
  CrabSummoned = 'CrabSummoned',
  BlueCheckmarkGiveGiftSelect = 'BlueCheckmarkGiveGiftSelect',
  BuyClick = 'BuyClick',
  BuyLinkClick = 'BuyLinkClick',
  BuySelect = 'BuySelect',
  ClaimLinkClick = 'ClaimLinkClick',
  ClaimSelect = 'ClaimSelect',
  GiveGiftClick = 'GiveGiftClick',
  GiveGiftSelect = 'GiveGiftSelect',
  BadgesCategoryShown = 'BadgesCategoryShown',
  MerchCategoryShown = 'MerchCategoryShown',
  GiftsCategoryShown = 'GiftsCategoryShown',
  TumblrMartGiveGiftClick = 'TumblrMartGiveGiftClick',
  TumblrMartGiveGiftThanks = 'TumblrMartGiveGiftThanks',
  TumblrMartReceiveGiftClick = 'TumblrMartReceiveGiftClick',
  TumblrMartReceiveGiftShare = 'TumblrMartReceiveGiftShare',
  TumblrMartReceiveGiftReply = 'TumblrMartReceiveGiftReply',
  TumblrMartBlueCheckmarksComplete = 'TumblrMartBlueCheckmarksComplete',
  TumblrmartHeaderMenuClick = 'TumblrmartHeaderMenuClick',
  TumblrMartPurchaseSuccess = 'TumblrMartPurchaseSuccess',
  TumblrMartShopClick = 'TumblrMartShopClick',
  TumblrMartBannerClick = 'TumblrMartBannerClick',
  TumblrMartLandingPageRedirect = 'TumblrMartLandingPageRedirect',
  RightRailAdRender = 'RightRailAdRender',
  RightRailAdNoRender = 'RightRailAdNoRender',
  ReblogPopoverOpen = 'reblog_popover_opened',
  ReblogPopoverClose = 'reblog_popover_cancel_pressed',
  ReblogPopoverBlogClick = 'reblog_popover_site_selected',
  ReblogPopoverReblogClick = 'reblog_popover_reblog_now_pressed',
  ReblogPopoverQueueClick = 'reblog_popover_queue_pressed',
  ReblogPopoverReblogWithCommentClick = 'reblog_popover_reblog_with_comment_pressed',
  ResetRecommendations = 'reset_recommendations',
  IntentSurveySubmit = 'intent_survey_submit',
  IntentSurveySkip = 'intent_survey_skip',
  IntentSurveyOptionClicked = 'intent_survey_option_clicked',
  TopicSelectionSubmit = 'topic_selection_submit',
  TopicSelectionSkip = 'topic_selection_skip',
  TopicSelectionOptionSelected = 'topic_selection_option_selected',
  TopicSelectionOptionDeselected = 'topic_selection_option_deselected',
  TopicSelectionFollowAll = 'topic_selection_follow_all',
  TopicSelectionUnfollowAll = 'topic_selection_unfollow_all',
  TopicSelectionError = 'topic_selection_error',
  RecommendedBlogsSubmit = 'recommended_blogs_submit',
  RecommendedBlogsSkip = 'recommended_blogs_skip',
  RecommendedBlogsDeselect = 'recommended_blogs_deselect',
  RecommendedBlogsFollowAll = 'recommended_blogs_follow_all',
  RecommendedBlogsUnfollowAll = 'recommended_blogs_unfollow_all',
  RegistrationSuccess = 'RegistrationSuccess',
  RegistrationFailed = 'RegistrationFailed',
  OnboardingStep = 'onboarding_step',
  OnboardingStepBack = 'onboarding_step_back',
  AdBlockEnabled = 'ad_block_enabled',
  SuggestCommunityLabelClick = 'SuggestCommunityLabelClick',
  CommunityLabelInfoButtonClicked = 'CommunityLabelInfoButtonClicked',
  CommunityLabelRequestReviewButtonClicked = 'CommunityLabelRequestReviewButtonClicked',
  CommunityLabelDismissButtonClicked = 'CommunityLabelDismissButtonClicked',
  CommunityLabelLearnMoreButtonClicked = 'CommunityLabelLearnMoreButtonClicked',
  CommunityLabelCancelReviewButtonClicked = 'CommunityLabelCancelReviewButtonClicked',
  AdFreeAdBlockCtaImpression = 'AdFreeAdBlockCtaImpression',
  AdFreeGiftCtaImpression = 'AdFreeGiftCtaImpression',
  AdFreeCtaDismissClick = 'AdFreeCtaDismissClick',
  AdFreeCtaActionClick = 'AdFreeCtaActionClick',
  Hotkey = 'hotkey',
  LiveStreamingWebPaymentsScreenShown = 'LiveStreamingWebPaymentsScreenShown',
  AppOpenBannerDismiss = 'AppOpenBannerDismiss',
  TimelineOptionChange = 'TimelineOptionChange',
  MobileHeaderSearch = 'MobileHeaderSearch',

  // Search typeahead
  SearchBarClickExpanded = 'SearchBarClickExpanded',
  SearchTypeaheadStartTap = 'SearchTypeaheadStartTap',
  SearchTypeaheadCancelTap = 'SearchTypeaheadCancelTap',
  SearchTypeaheadEnterTap = 'SearchTypeaheadEnterTap',
  SearchSuggestionRecentSearchTap = 'SearchSuggestionRecentSearchTap',
  SearchSuggestionRecentSearchClearTap = 'SearchSuggestionRecentSearchClearTap',
  SearchSuggestionFollowedTagTap = 'SearchSuggestionFollowedTagTap',
  SearchSuggestionGoToFollowedTagsTap = 'SearchSuggestionGoToFollowedTagsTap',
  EmptySearchSuggestionTrendingTagTap = 'EmptySearchSuggestionTrendingTagTap',
  SearchSuggestionTrendingTagTap = 'SearchSuggestionTrendingTagTap',
  SearchTypeaheadTagResultTap = 'SearchTypeaheadTagResultTap',
  SearchTypeaheadBlogResultTap = 'SearchTypeaheadBlogResultTap',
  SearchTypeaheadBlogFollowTap = 'SearchTypeaheadBlogFollowTap',
  SearchTypeaheadGoToSearchTap = 'SearchTypeaheadGoToSearchTap',
  SearchTypeaheadGoToBlogTap = 'SearchTypeaheadGoToBlogTap',
  SearchTypeaheadGoToHubTap = 'SearchTypeaheadGoToHubTap',

  AfterPostBannerView = 'AfterPostBannerView',
  AfterPostBannerBlazeClick = 'AfterPostBannerBlazeClick',
  AfterPostBannerShareClick = 'AfterPostBannerShareClick',
  AfterPostBannerCloseClick = 'AfterPostBannerCloseClick',
  SignpostCTATapped = 'SignpostCTATapped',
  ShareYourBlogClick = 'ShareYourBlogClick',
  NotesPreviewNoteClick = 'preview_note_selected',
  BlazeLandingPageAllTab = 'BlazeLandingPageAllTab',
  BlazeLandingPageActiveTab = 'BlazeLandingPageActiveTab',
  BlazeLandingPageDoneTab = 'BlazeLandingPageDoneTab',
  BlazeLandingPageBlazeAgainTap = 'BlazeLandingPageBlazeAgainTap',
  BlazeLandingPageInsightsViewTap = 'BlazeLandingPageInsightsViewTap',
  BlazeLandingPageSupportTap = 'BlazeLandingPageSupportTap',
  EmbedPostClick = 'EmbedPostClick',
  // Tumblr Live
  TumblrLiveLiveMarqueeShown = 'TumblrLive_LiveMarqueeShown',
  TumblrLiveLiveMarqueeHidden = 'TumblrLive_LiveMarqueeHidden',
  TumblrLiveLiveMarqueeLoadError = 'TumblrLive_LiveMarqueeLoadError',
  TumblrLiveLiveMarqueeLoadErrorRateLimit = 'TumblrLive_LiveMarqueeLoadErrorRateLimit',
  TumblrLiveLiveMarqueeShowBroadcast = 'TumblrLive_LiveMarqueeShowBroadcast',
  TumblrLiveLiveMarqueeTagsOnlyShown = 'TumblrLive_LiveMarqueeTagsOnlyShown',
  TumblrLiveLiveMarqueeShowMore = 'TumblrLive_LiveMarqueeShowMore',
  TumblrLiveLiveMarqueeTagClick = 'TumblrLive_LiveMarqueeTagClick',
  TumblrLiveLiveMarqueeUnselectTagClick = 'TumblrLive_LiveMarqueeUnselectTagClick',
  TumblrLiveLiveMarqueeAllClick = 'TumblrLive_LiveMarqueeAllClick',
  TumblrLiveLiveMarqueeStartClick = 'TumblrLive_LiveMarqueeStartClick',
  TumblrLiveLiveMarqueeStartFromEmptyStateClick = 'TumblrLive_LiveMarqueeStartFromEmptyStateClick',
  TumblrLiveLiveAccessed = 'TumblrLive_LiveAccessed',
  TumblrLiveInitCallFinished = 'TumblrLive_InitCallFinished',
  TumblrLiveViewBlogClick = 'TumblrLive_ViewBlogClick',
  TumblrLiveLivePreviewShown = 'TumblrLive_LivePreviewShown',
  TumblrLiveLivePreviewDismissed = 'TumblrLive_LivePreviewDismissed',
  TumblrLiveLivePreviewShowBroadcast = 'TumblrLive_LivePreviewShowBroadcast',
  TumblrLiveBroadcastStart = 'TumblrLive_BroadcastStart',
  TumblrLiveBroadcastEnd = 'TumblrLive_BroadcastEnd',
  TumblrLiveBirthdayDialogShown = 'TumblrLive_BirthdayDialogShown',
  TumblrLiveBirthdaySettingsClicked = 'TumblrLive_BirthdaySettingsClicked',
  TumblrLiveBirthdayDismissedClicked = 'TumblrLive_BirthdayDismissedClicked',
  TumblrLiveToSGetStartedClicked = 'TumblrLive_ToSGetStartedClicked',
  TumblrLiveToSCancelClicked = 'TumblrLive_ToSCancelClicked',
  TumblrLiveToSDialogShow = 'TumblrLive_ToSDialogShow',
  TumblrLiveToSOnboardingShown = 'TumblrLive_ToSOnboardingShown',
  TumblrLiveToSOnboardingAccepted = 'TumblrLive_ToSOnboardingAccepted',
  TumblrLiveToSOnboardingDeclined = 'TumblrLive_ToSOnboardingDeclined',
  TumblrLiveStreamObjectShown = 'TumblrLive_StreamObjectShown',
  TumblrLiveStreamObjectShowBroadcast = 'TumblrLive_StreamObjectShowBroadcast',

  // Domain add
  DomainAddScreenView = 'DomainAddScreenView',
  DomainAddConnectClick = 'DomainAddConnectClick',
  DomainAddConnectFailed = 'DomainAddConnectFailed',
  DomainAddConnectBannerClick = 'DomainAddConnectBannerClick',
  DomainAddTransferBannerClick = 'DomainAddTransferBannerClick',
  DomainAddTransferClick = 'DomainAddTransferClick',
  DomainAddConnectSelect = 'DomainAddConnectSelect',
  DomainAddTransferSelect = 'DomainAddTransferSelect',
  DomainConnectRejectedDismissClick = 'DomainConnectRejectedDismissClick',
  DomainAddDomainPurchaseBannerClick = 'DomainAddDomainPurchaseBannerClick',
  DomainTransferAuthorizationCodeSubmit = 'DomainTransferAuthorizationCodeSubmit',
  DomainTransferDomainPurchaseBannerClick = 'DomainTransferDomainPurchaseBannerClick',
  DomainTransferScreenView = 'DomainTransferScreenView',
  DomainTransferRejected = 'DomainTransferRejected',
  DomainTransferRejectedDomainPurchaseClick = 'DomainTransferRejectedDomainPurchaseClick',
  DomainTransferRejectedDomainConnectClick = 'DomainTransferRejectedDomainConnectClick',
  DomainTransferRejectedDismissClick = 'DomainTransferRejectedDismissClick',
  DomainTransferRejectedTryAgainClick = 'DomainTransferRejectedTryAgainClick',
  // Domains management events
  DomainsManagementAddNewClick = 'DomainsManagementAddNewClick',
  DomainsManagementEditClick = 'DomainsManagementEditClick',
  DomainsManagementScreenView = 'DomainsManagementScreenView',
  DomainsManagementCheckoutCancelled = 'DomainsManagementCheckoutCancelled',
  // Domain settings events
  DomainSettingsAutoRenewDisabled = 'DomainSettingsAutoRenewDisabled',
  DomainSettingsAutoRenewEnabled = 'DomainSettingsAutoRenewEnabled',
  DomainSettingsBlogConnectionConfirmed = 'DomainSettingsBlogConnectionConfirmed',
  DomainSettingsBlogConnectionDisabled = 'DomainSettingsBlogConnectionDisabled',
  DomainSettingsBlogConnectionEnabled = 'DomainSettingsBlogConnectionEnabled',
  DomainSettingsBlogConnectionCancelled = 'DomainSettingsBlogConnectionCancelled',
  DomainSettingsBlogDisconnectConfirmed = 'DomainSettingsBlogDisconnectConfirmed',
  DomainSettingsBlogDisconnectCancelled = 'DomainSettingsBlogDisconnectCancelled',
  DomainSettingsCheckoutCompleted = 'DomainSettingsCheckoutCompleted',
  DomainSettingsEditContactInfoClick = 'DomainSettingsEditContactInfoClick',
  DomainSettingsEditPaymentDetailsClick = 'DomainSettingsEditPaymentDetailsClick',
  DomainSettingsAddDnsCancel = 'DomainSettingsAddDnsCancel',
  DomainSettingsAddDnsClick = 'DomainSettingsAddDnsClick',
  DomainSettingsAddDnsSubmit = 'DomainSettingsAddDnsSubmit',
  DomainSettingsAddDnsScreenView = 'DomainSettingsAddDnsScreenView',
  DomainSettingsDeleteDnsSubmit = 'DomainSettingsDeleteDnsSubmit',
  DomainSettingsEditDnsCancel = 'DomainSettingsEditDnsCancel',
  DomainSettingsEditDnsClick = 'DomainSettingsEditDnsClick',
  DomainSettingsEditDnsSubmit = 'DomainSettingsEditDnsSubmit',
  DomainSettingsEditDnsScreenView = 'DomainSettingsEditDnsScreenView',
  DomainSettingsManageDnsClick = 'DomainSettingsManageDnsClick',
  DomainSettingsManageDnsScreenView = 'DomainSettingsManageDnsScreenView',
  DomainSettingsPanelToggled = 'DomainSettingsPanelToggled',
  DomainSettingsPrivacyProtectionDisabled = 'DomainSettingsPrivacyProtectionDisabled',
  DomainSettingsPrivacyProtectionEnabled = 'DomainSettingsPrivacyProtectionEnabled',
  DomainSettingsPublicContactInfoDisabled = 'DomainSettingsPublicContactInfoDisabled',
  DomainSettingsPublicContactInfoEnabled = 'DomainSettingsPublicContactInfoEnabled',
  DomainSettingsScreenView = 'DomainSettingsScreenView',
  DomainSettingsSendAuthorizationCodeClick = 'DomainSettingsSendAuthorizationCodeClick',
  DomainSettingsTransferLockDisabled = 'DomainSettingsTransferLockDisabled',
  DomainSettingsTransferLockEnabled = 'DomainSettingsTransferLockEnabled',
  BlogSettingsGetDomainClick = 'BlogSettingsGetDomainClick',
  BlogSettingsDomainSettingsClick = 'BlogSettingsDomainSettingsClick',
  BlogSettingsPurchaseDomainClick = 'BlogSettingsPurchaseDomainClick',
  BlogSettingsTransferDomainClick = 'BlogSettingsTransferDomainClick',
  BlogSettingsConnectDomainClick = 'BlogSettingsConnectDomainClick',
  AccountDeleteDomainsWarningCancelClick = 'AccountDeleteDomainsWarningCancelClick',
  AccountDeleteDomainsWarningSupportClick = 'AccountDeleteDomainsWarningSupportClick',
  // Domain purchase events
  DomainPurchaseScreenView = 'DomainPurchaseScreenView',
  DomainPurchaseSearchClick = 'DomainPurchaseSearchClick',
  DomainPurchaseSuggestionClick = 'DomainPurchaseSuggestionClick',
  DomainPurchaseTransferClick = 'DomainPurchaseTransferClick',
  DomainPurchaseConnectClick = 'DomainPurchaseConnectClick',
  // Domain search events
  DomainSearchBuyClick = 'DomainSearchBuyClick',
  DomainSearchScreenView = 'DomainSearchScreenView',
  DomainSearchSearchClick = 'DomainSearchSearchClick',
  DomainSearchShowMoreClick = 'DomainSearchShowMoreClick',
  // Jingle bells
  JingleBellsStart = 'JingleBellsStart',
  JingleBellsRing = 'JingleBellsRing',
  JingleBellsSnowUnlocked = 'JingleBellsSnowUnlocked',
  JingleBellsSnowToggleOn = 'JingleBellsSnowToggleOn',
  JingleBellsSnowToggleOff = 'JingleBellsSnowToggleOff',
  JingleBellsHotkeyToggleOn = 'JingleBellsHotkeyToggleOn',
  JingleBellsHotkeyToggleOff = 'JingleBellsHotkeyToggleOff',
  JingleBellsSearchTune = 'JingleBellsSearchTune',
  // Sessions
  SessionStart = 'SessionStart',
  SessionEnd = 'SessionEnd',

  // Configurable Tabbbed Dash
  TabMove = 'TabMove',
  TabActivate = 'TabActivate',
  TabDeactivate = 'TabDeactivate',
  DashboardTabScreenView = 'DashboardTabScreenView',
  DashboardTabScreenLeft = 'DashboardTabScreenLeft',
  TabbedDashboardTabChanged = 'TabbedDashboardTabChanged',
  TabPinned = 'TabPinned',
  PinnedTabSetToFollowing = 'PinnedTabSetToFollowing',
  PinnedTabSetToForYou = 'PinnedTabSetToForYou',

  // Community hub
  HubFollowed = 'HubFollowed',
  HubUnfollowed = 'HubUnfollowed',
  FollowHubCTAClickDismiss = 'FollowHubCTAClickDismiss',
  FollowHubCTAImpression = 'FollowHubCTAImpression',

  // Blaze other people post announcement
  BlazeOtherPeopleAnnouncementShown = 'BlazeOtherPeopleAnnouncementShown',
  BlazeOtherPeopleAnnouncementClose = 'BlazeOtherPeopleAnnouncementClose',
  BlazeOtherPeopleAnnouncementTakeMeToSettings = 'BlazeOtherPeopleAnnouncementTakeMeToSettings',
  BlazeOtherPeopleAnnouncementAcknowledgeCallFailed =
    'BlazeOtherPeopleAnnouncementAcknowledgeCallFailed',

  BlazeOtherPeopleAnnouncementFaqClicked = 'BlazeOtherPeopleAnnouncementFaqClicked',
  BlazeOtherPeopleAnnouncementHelpClicked = 'BlazeOtherPeopleAnnouncementHelpClicked',

  BlazeModalFaqClicked = 'BlazeModalFaqClicked',
  BlazeModalHelpClicked = 'BlazeModalHelpClicked',
  BadgeManagementOpen = 'BadgeManagementOpen',
  BadgeManagementYourBadgesTabSelect = 'BadgeManagementYourBadgesTabSelect',
  BadgeManagementShopTabSelect = 'BadgeManagementShopTabSelect',
  BadgeManagementEarnTabSelect = 'BadgeManagementEarnTabSelect',
  BadgeManagementUpdateBadge = 'BadgeManagementUpdateBadge',
  BadgeManagementUpdateBadgeNone = 'BadgeManagementUpdateBadgeNone',
  BadgeManagementBuySelect = 'BadgeManagementBuySelect',
  BadgeManagementPurchaseSuccess = 'BadgeManagementPurchaseSuccess',
  BadgeManagementGiftSuccess = 'BadgeManagementGiftSuccess',
  BadgeManagementGiftOpen = 'BadgeManagementGiftOpen',
  BadgeEarnedClick = 'BadgeEarnedClick',
  BadgeEarnedManageClick = 'BadgeEarnedManageClick',
  // Activity Highlights
  ActivityHighlightsPostClicked = 'ActivityHighlightsPostClicked',

  // Vertical Navigation
  HomeNavClick = 'NavItemClick:Home',
  ExploreNavClick = 'NavItemClick:Explore',
  InboxNavClick = 'NavItemClick:Inbox',
  SettingsNavClick = 'NavItemClick:Settings',
  DomainsNavClick = 'NavItemClick:Domains',
  AdFreeNavClick = 'NavItemClick:AdFree',
  AccountSettingsNavClick = 'NavItemClick:SettingsMenu:Account',
  DashboardSettingsNavClick = 'NavItemClick:SettingsMenu:Dashboard',
  NotificationsSettingsNavClick = 'NavItemClick:SettingsMenu:Notifications',
  DomainsSettingsNavClick = 'NavItemClick:SettingsMenu:Domains',
  AdFreeSettingsNavClick = 'NavItemClick:SettingsMenu:AdFree',
  PurchasesSettingsNavClick = 'NavItemClick:SettingsMenu:Purchases',
  SubscriptionsSettingsNavClick = 'NavItemClick:SettingsMenu:Subscriptions',
  AppsSettingsNavClick = 'NavItemClick:SettingsMenu:Apps',
  PrivacySettingsNavClick = 'NavItemClick:SettingsMenu:Privacy',
  LabsSettingsNavClick = 'NavItemClick:SettingsMenu:Labs',
  GiftsSettingsNavClick = 'NavItemClick:SettingsMenu:Gifts',
  LikesNavClick = 'NavItemClick:AccountMenu:Likes',
  FollowingNavClick = 'NavItemClick:AccountMenu:Following',
  CreditsNavClick = 'NavItemClick:AccountMenu:Credits',
  ShortcutsNavClick = 'NavItemClick:AccountMenu:Shortcuts',
  BlogNavClick = 'NavItemClick:AccountMenu:Blog',
  BlogPostsNavClick = 'NavItemClick:BlogMenu:Posts',
  BlogFollowersNavClick = 'NavItemClick:BlogMenu:Followers',
  BlogActivityNavClick = 'NavItemClick:BlogMenu:Activity',
  BlogDraftsNavClick = 'NavItemClick:BlogMenu:Drafts',
  BlogQueueNavClick = 'NavItemClick:BlogMenu:Queue',
  BlogPostPlusNavClick = 'NavItemClick:BlogMenu:PostPlus',
  BlogBlazeNavClick = 'NavItemClick:BlogMenu:Blaze',
  BlogSettingsNavClick = 'NavItemClick:BlogMenu:Settings',
  BlogReviewNavClick = 'NavItemClick:BlogMenu:Review',
  BlogMegaEditorNavClick = 'NavItemClick:BlogMenu:MegaEditor',
  LabsNavClick = 'NavItemClick:LabsMenu',
  CloseNavClick = 'NavItemClick:CloseMenu',
  ExtensionDetected = 'ExtensionDetected',

  // Improved link sharing
  ReferralShareLinkOpened = 'ReferralShareLinkOpened',

  // Force onboarding
  OnboardingOptionsButtonTapped = 'OnboardingOptionsButtonTapped',
  OnboardingSkipOptionSelected = 'OnboardingSkipOptionSelected',
  OnboardingAccountSettingsOptionSelected = 'OnboardingAccountSettingsOptionSelected',
  OnboardingSkipCancelled = 'OnboardingSkipCancelled',
  OnboardingSkipConfirmed = 'OnboardingSkipConfirmed',
}

type EventName =
  | KrakenEvent
  | MediationAnalyticsEventType
  | SupplyClientEventType
  | DemandClientEventType
  | AdUserSyncEventType
  | VideoAnalyticsExternalEvent
  | CollectionsEventType
  | CommunitiesEventType;

export type PFComposePostType =
  | KrakenEvent.PFComposePost
  | KrakenEvent.PFComposePostAudio
  | KrakenEvent.PFComposePostText
  | KrakenEvent.PFComposePostPhoto
  | KrakenEvent.PFComposePostQuote
  | KrakenEvent.PFComposePostLink
  | KrakenEvent.PFComposePostChat
  | KrakenEvent.PFComposePostVideo;

export interface EventInfo<EventDetailsType = { [key: string]: any }> {
  eventName: EventName;
  page?: 'Server' | PageNameForPostFormEntryPoint | string;
  eventDetails?: EventDetailsType;
  experiments?: { [key: string]: any };
  pathname?: string;
}

export interface CustomMetricInfo {
  metricName: string;
  value: number;
  eventDetails?: { [key: string]: any };
}

export interface PerformanceInfo {
  /** Domain name of the metrics e.g. PultWarmStart, NetworkPerformance… */
  domain: string;

  /** Name of the specific timer within the domain e.g. connectStart, domInteractive… */
  timer: string;

  /** Offset this timer started at for waterfall timers. Set to 0 otherwise. */
  offset: number;

  /** The actual timing value */
  duration: number;

  /** Timestamp in nanoseconds */
  ts?: number;

  page?: string;

  /** Arbitrary JSON-stringifiable data */
  eventDetails?: { [key: string]: unknown };
}

export interface KrakenInfo {
  basePage: string;
  krakenBaseUrl: string;
  routeSet: RouteSet;
  sessionId: string;
  clientDetails: {
    platform?: string;
    os_name?: string;
    os_version?: string;
    browser_name?: string;
    browser_version?: string;
    language?: string;
    build_version?: string;
    form_factor?: string;
    model?: string;
    connection?: string;
    carrier?: string;
    manufacturer?: string;
  };
  configRef?: ConfigRef;
}

export interface TakeoverAd {
  objectType: string;
  id: string;
  takeoverTerm?: string;
  blogUrl?: string;
  blog?: any;
  title?: string;
  displayType: number;
  sponsoredBadgeUrl?: string;
  takeoverType: string;
  adProviderId: string;
  adProviderPlacementId?: string;
  adProviderForeignPlacementId: string;
  adProviderInstanceId: string;
  adRequestId: string;
  fillId: string;
  adInstanceId: string;
  adInstanceCreatedTimestamp: number;
  price: number;
  isTumblrSponsoredPost: boolean;
  advertiserId?: string;
  campaignId: string;
  creativeId: string;
  adGroupId?: string;
  text?: string;
  caption?: string;
  mediationCandidateId: string;
  placementId: string;
  supplyOpportunityInstanceId: string;
  supplyRequestId?: string;
  supplyProviderId: SupplyProviderId;
}

interface TakeoverLoggedOut {
  imageUrl: string;
  imageAvatarUrl?: string;
  imageBlogName?: string;
  imageBlogUrl?: string;
  imageArtistName?: string;
  imageArtistUrl?: string;
  takeoverAd?: TakeoverAd;
}

export interface ConfigRef {
  takeoverLogoUrl?: string;
  takeoverLoggedOut?: TakeoverLoggedOut;
  autoTruncatePosts?: string;
  flags: string;
  tumblrmartLastUpdated?: number;
}

export type ImpressionInfo = EventInfo & {
  placementId?: string;
  displayType?: AdvertisementType;
  serveId?: string;
};

interface LogOptions {
  sendPayloadImmediately?: boolean;
  allowRepeatedImpressions?: boolean;
}

export type LogEvent = (eventInfo: EventInfo, options?: LogOptions) => Promise<void>;
export type LogImpression = (impressionInfo: ImpressionInfo, options?: LogOptions) => Promise<void>;
export type LogPerformanceMetric = (performanceInfo: PerformanceInfo) => Promise<void>;

export type PostFormLoggingState =
  | 'new'
  | 'reblog'
  | 'edit'
  | 'answer'
  // To be added later.
  | 'submission'
  | 'ask';

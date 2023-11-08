export type DashboardTabId =
  | 'following'
  | 'stuff_for_you'
  | 'hubs'
  | 'wym'
  | 'blog_subs'
  | 'tumblr_tv'
  | 'crushes'
  | 'popular_reblogs'
  | 'blazed_posts'
  | 'trending';

export type DashboardPageParams = {
  tabId?: DashboardTabId;
};

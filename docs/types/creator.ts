import { BlogViewParams } from 'types/blog-view';

import { Blog } from './blog';

export type CreatorParams = BlogViewParams & {
  creatorPageContents?: CreatorPageContents;
};

// Subpages for Creator settings management
type CreatorPageContents = 'supporters';

// Home for Creator settings management
export const creatorPageSettings = 'settings';

// All the Creator-specific pages
export type CreatorPageVariants = CreatorPageContents | typeof creatorPageSettings;

export interface CreatorPageState {
  blog: Blog;
  isFetching?: boolean;
  isActivating?: boolean;
  isReactivating?: boolean;
}

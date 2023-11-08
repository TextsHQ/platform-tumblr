import { BlogQueryParamsForApi } from 'utils/blog-query-params';

import { LinksNext } from './api-fetch';
import { Block, GIFSearchAttribution, ImageBlock } from './posts';

export interface GifResponseData {
  gifs: GifResponseGif[];
  flags: {
    isPsa: boolean;
  };
  message: {
    blocks: Block[];
  };
  links: LinksNext<GifQueryParams>;
}

export interface GifResponseGif extends ImageBlock {
  attribution: GIFSearchAttribution; // Override this since ImageBlock allows for `ContentSourceAttribution` type, too.
}

// TODO [PW-121]: This interface is not just specific to GIFs, but to pretty much anything with pagination queryParams
export interface GifQueryParams extends BlogQueryParamsForApi {
  limit?: number;
  offset?: number;
  context?: string;
}

export interface TagQueryParams extends BlogQueryParamsForApi {
  blog?: string;
  limit?: number;
}

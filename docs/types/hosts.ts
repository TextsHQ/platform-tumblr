export const WWW_HOST = 'www.tumblr.com';
export const API_HOST = 'api.tumblr.com';
export const BASE_MEDIA_HOST = 'media.tumblr.com';
export const MEDIA_HOST = `64.${BASE_MEDIA_HOST}`;
export const MEDIA_ROUTES_PREFIX = 'redirect.media';
export const MEDIA_ROUTES_HOST = 'redirect.media.tumblr.com';
export const EMBED_PREFIX = 'embed';
export const EMBED_HOST = 'embed.tumblr.com';
export const TMG_URL = 'https://www.themeetgroup.com/';

// Prefer using appContext.wwwBaseUrl when linking to legacy web so it varies in dev and test envs.
export const WWW_BASE_URL = `https://${WWW_HOST}`;

export interface ParsedInternalHost {
  prefix?: string;
  apiPrefix?: string;
  environment?: string;
  base: string;

  /** Whether the api should be hit directly on /v2 without the /api prefix */
  hasDirectApi: boolean;
}

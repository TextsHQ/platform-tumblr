export type { APILink, APILinks } from 'schemas/api-links';

/**
 * Sometimes elements from the backend dictate how they want themselves to be
 */
export interface ElementLinks {
  tap: {
    href: string;
    type: LinkType;
  };
  self?: {
    href: string;
    type: LinkType;
  };
}

export enum LinkType { // eslint-disable-line no-restricted-syntax
  Action = 'action',
  Web = 'web',
  API = 'api',
}

export interface RichApiLink {
  type: LinkType;
  href: string;
  method?: string;
  launchNewTab?: boolean;
  bodyParams?: { [key: string]: string };
}

export interface QueryParamsApiLink {
  href: string;
  method: string;
  queryParams: {
    offset: string;
    [key: string]: string;
  };
}

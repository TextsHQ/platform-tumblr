import { Dispatch } from 'react';

import { AppContext } from 'utils/contexts/app-context';

import { TranslateFunctions } from '../utils/make-translate-functions';

import { BlogViewParams } from './blog-view';
import { KrakenEvent } from './logging';

export enum SettingsPageName { // eslint-disable-line no-restricted-syntax
  Account = 'account',
  Dashboard = 'dashboard',
  Notifications = 'notifications',
  DomainAdd = 'domain-add',
  DomainAddAny = 'domain-add-any',
  DomainTransfer = 'domain-transfer',
  DomainsManagement = 'domains',
  DomainPurchase = 'domain-purchase',
  DomainSearch = 'domain-search',
  DomainSettings = 'domain',
  DomainManageDns = 'domain-manage-dns',
  DomainManageDnsAdd = 'domain-manage-dns-add',
  DomainManageDnsEdit = 'domain-manage-dns-edit',
  AdFreeBrowsing = 'ad-free-browsing',
  Subscriptions = 'subscriptions',
  Apps = 'apps',
  Privacy = 'privacy',
  Admin = 'admin',
  Labs = 'labs',
  Purchases = 'purchases',
  Gifts = 'gifts',
}

export type SettingsChildProps = {
  setBlurred: Dispatch<boolean>;
};

export type SettingsPageParams = {
  page: SettingsPageName;
};

export type BlogSettingsParams = BlogViewParams;

export type ContextCheck = ((appContext: AppContext) => boolean) | boolean | undefined;

export interface SettingsPageConfig {
  title: (translateFunctions: TranslateFunctions) => string;
  description: (translateFunctions: TranslateFunctions) => string;
  // Certain settings pages have special routing configurations. To support that, `routes` can
  // return route patterns to match.
  routes?: () => string[];
  isVisible: ContextCheck;
  isFeaturedAsNew?: ContextCheck;
  isVisibleInNavigation?: ContextCheck;
  isActiveInNavigationFor?: () => SettingsPageName[];
  analyticsPageName?: string;
  clickEvent?: KrakenEvent;
}

export type SettingsPagesConfigs = Record<SettingsPageName, SettingsPageConfig>;

export interface ActiveSessionInterface {
  id: string;
  parsedUa: string; // parsed user agent
  parsedOs?: string; // parsed operating system
  location?: string;
  clientIp?: string;
  lastSeenText: string;
  lastSeenDate?: string;
}

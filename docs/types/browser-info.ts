import DeviceType from 'types/device';

import type { IResult } from 'ua-parser-js';

export default interface BrowserInfo { // eslint-disable-line import/no-default-export
  userAgent: IResult;
  isSupported: boolean;
  deviceType: DeviceType;
  isCrawler: boolean;
}

// Maps to: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/ua-parser-js/index.d.ts#L70
// Add as needed.
export enum OSName { // eslint-disable-line no-restricted-syntax
  MacOS = 'Mac OS',
  IOS = 'iOS',
  Android = 'Android',
}

// Maps to: https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/ua-parser-js/index.d.ts#L8
// Add as needed.
export enum BrowserName { // eslint-disable-line no-restricted-syntax
  MobileSafari = 'Mobile Safari',
  Safari = 'Safari',
  Chrome = 'Chrome',
  IE = 'IE',
}

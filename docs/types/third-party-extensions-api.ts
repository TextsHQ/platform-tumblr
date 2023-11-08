import { ApiFetch } from './api-fetch';
import { LanguageCode } from './languages';

export interface ThirdPartyExtensionsCssMap {
  [className: string]: string[];
}

export interface ThirdPartyExtensionsLanguageData {
  code: LanguageCode;
  translations: { [key: string]: string };
}

export type ThirdPartyExtensionEvent = 'navigation';
export type ThirdPartyExtensionEventHandler = () => void;

export interface ThirdPartyExtensionsApi {
  getCssMap?: () => Promise<ThirdPartyExtensionsCssMap>;
  apiFetch?: ApiFetch;
  languageData?: ThirdPartyExtensionsLanguageData;
  navigate?: (pathname: string) => void;
  on?: (eventName: ThirdPartyExtensionEvent, callback: ThirdPartyExtensionEventHandler) => void;
  off?: (eventName: ThirdPartyExtensionEvent, callback: ThirdPartyExtensionEventHandler) => void;
}

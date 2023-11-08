export enum Languages { // eslint-disable-line no-restricted-syntax
  German = 'de_DE',
  English = 'en_US',
  Spanish = 'es_ES',
  French = 'fr_FR',
  Hindi = 'hi_IN',
  Indonesian = 'id_ID',
  Italian = 'it_IT',
  Japanese = 'ja_JP',
  Korean = 'ko_KR',
  Dutch = 'nl_NL',
  Polish = 'pl_PL',
  PortugueseBrazil = 'pt_BR',
  PortuguesePortugal = 'pt_PT',
  Russian = 'ru_RU',
  Turkish = 'tr_TR',
  ChineseSimplified = 'zh_CN',
  ChineseTraditionalHongKong = 'zh_HK',
  ChineseTraditionalTaiwan = 'zh_TW',
}

export const localizationToCode: Record<Languages, string> = {
  [Languages.German]: 'de',
  [Languages.English]: 'en',
  [Languages.Spanish]: 'es',
  [Languages.French]: 'fr',
  [Languages.Hindi]: 'hi',
  [Languages.Indonesian]: 'id',
  [Languages.Italian]: 'it',
  [Languages.Japanese]: 'ja',
  [Languages.Korean]: 'ko',
  [Languages.Dutch]: 'nl',
  [Languages.Polish]: 'pl',
  [Languages.PortugueseBrazil]: 'pt_BR',
  [Languages.PortuguesePortugal]: 'pt_PT',
  [Languages.Russian]: 'ru',
  [Languages.Turkish]: 'tr',
  [Languages.ChineseSimplified]: 'zh_CN',
  [Languages.ChineseTraditionalHongKong]: 'zh_HK',
  [Languages.ChineseTraditionalTaiwan]: 'zh_TW',
};

interface LanguageName {
  name: string;
  localizedName: string;
}

export const languageNames: Record<Languages, LanguageName> = {
  [Languages.English]: { name: 'English', localizedName: 'English' },
  [Languages.German]: { name: 'German', localizedName: 'Deutsch' },
  [Languages.French]: { name: 'French', localizedName: 'Français' },
  [Languages.Italian]: { name: 'Italian', localizedName: 'Italiano' },
  [Languages.Japanese]: { name: 'Japanese', localizedName: '日本語' },
  [Languages.Turkish]: { name: 'Turkish', localizedName: 'Türkçe' },
  [Languages.Spanish]: { name: 'Spanish', localizedName: 'Español' },
  [Languages.Russian]: { name: 'Russian', localizedName: 'Pусский' },
  [Languages.Polish]: { name: 'Polish', localizedName: 'Polski' },
  [Languages.PortuguesePortugal]: { name: 'Portuguese (PT)', localizedName: 'Português (PT)' },
  [Languages.PortugueseBrazil]: { name: 'Portuguese (BR)', localizedName: 'Português (BR)' },
  [Languages.Dutch]: { name: 'Dutch', localizedName: 'Nederlands' },
  [Languages.Korean]: { name: 'Korean', localizedName: '한국어' },
  [Languages.ChineseSimplified]: { name: 'Chinese (Simplified)', localizedName: '简体中文' },
  [Languages.ChineseTraditionalTaiwan]: {
    name: 'Chinese (Traditional)',
    localizedName: '繁體中文 (台灣)',
  },
  [Languages.ChineseTraditionalHongKong]: {
    name: 'Chinese (HK)',
    localizedName: '繁體中文 (香港)',
  },
  [Languages.Indonesian]: { name: 'Indonesian', localizedName: 'Bahasa Indonesia' },
  [Languages.Hindi]: { name: 'Hindi', localizedName: 'हिंदी' },
};

export const defaultLanguage = Languages.English;

type LongLanguageType = 'long';
export const longLanguage: LongLanguageType = 'long';

export type LanguageCode = Languages | LongLanguageType;

import { PopupParams } from 'utils/open-popup-window';

export enum ShareActionType { // eslint-disable-line no-restricted-syntax
  Facebook = 'Facebook',
  Twitter = 'Twitter',
  Embed = 'Embed',
  Pinterest = 'Pinterest',
  Reddit = 'Reddit',
  Copy = 'Copy',
}

export enum ShareLinkUrlStub { // eslint-disable-line no-restricted-syntax
  Facebook = 'https://www.facebook.com/sharer/sharer.php',
  Twitter = 'https://twitter.com/intent/tweet',
  Pinterest = 'https://www.pinterest.com/pin/create/button/',
  Reddit = 'https://www.reddit.com/submit',
}

export const sharePopupParamsObj: PopupParams = {
  top: 0,
  left: 0,
  width: 600,
  height: 450,
  toolbar: 'no',
  menubar: 'no',
};

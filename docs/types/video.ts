import type { Image } from 'schemas/image';

export enum VideoProvider { // eslint-disable-line no-restricted-syntax
  Youtube = 'youtube',
  Tumblr = 'tumblr',
  Flickr = 'flickr',
  Instagram = 'instagram',
}

export enum VideoMediaType { // eslint-disable-line no-restricted-syntax
  Mov = 'video/quicktime',
  Mp4 = 'video/mp4',
  AppleM4v = 'video/x-m4v',
}

export enum HasPausedSource { // eslint-disable-line no-restricted-syntax
  User = 'User',
  Glass = 'Glass',
  DocumentVisibility = 'DocumentVisibility',
}

export interface Video {
  provider?: VideoProvider;
  url: string;
  height?: number;
  width?: number;
  type?: VideoMediaType;
  poster?: Image;
}

export interface EmbedIframe {
  url: string;
  height: number;
  width: number;
}

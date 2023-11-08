import type { Image } from 'schemas/image';

export type { Image };

export interface ImageColors {
  [key: string]: string;
}

export type ImageResponse = Image[];

export type ImageWithScales = {
  '1x': string;
  '2x': string;
  '3x'?: string | undefined;
};

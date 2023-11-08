import { ImageResponse } from './img';

interface Broadcast {
  id: string;
  description?: string;
  totalViewers: number;
  tags?: string[];
}

interface Broadcaster {
  id?: number;
  name: string;
  avatar: ImageResponse;
  featured?: boolean;
}

export interface BroadcastItem {
  broadcast: Broadcast;
  user: Broadcaster;
}

export interface BroadcastFromSDK {
  broadcastId: string;
  streamDescription: string;
  streamerFirstName: string;
  totalViewers: number;
  profilePic: {
    large: string;
    square: string;
  };
  tags?: string[];
  currentViewers?: number;
  networkUserId?: string;
  distanceInKm?: number | null;
}

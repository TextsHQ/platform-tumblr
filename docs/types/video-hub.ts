import { ElementLinks } from 'types/api-link';
import { Image } from 'types/img';
import {
  CarouselElement,
  TimelineObject,
  TimelineObjectCarouselType,
  TimelineObjectType,
} from 'types/timeline';
import { Video } from 'types/video';

export type VideoHubRouteParams = {
  hubName: string;
  blogName?: string;
  postId?: string;
};

export interface VideoHub extends CarouselElement {
  hubName: string;
  title: string;
  subtitle?: string;
  borderColor: string;
  objectType: TimelineObjectCarouselType.VideoHubCard;
  tags?: string[];
  media: Image[];
  mediaPost: {
    url: string;
    id: string;
    tumblelog: string;
  };
  links?: ElementLinks;
}

export interface VideoHubTimelineObject extends TimelineObject {
  objectType: TimelineObjectType.VideoHubCard;
  hubName: string;
  title: string;
  links: ElementLinks;
  borderColor: string;
  media: Video[];
  mediaPost: {
    url: string;
    id: string;
    tumblelog: string;
  };
  tags: string[];
}

export interface VideoHubsFeatured extends TimelineObject {
  objectType: TimelineObjectType.VideoHubCard;
  hubName: string;
  title: string;
  links: ElementLinks;
  borderColor: string;
  media: Video[];
  mediaPost: {
    url: string;
    id: string;
    tumblelog: string;
  };
  tags: string[];
}

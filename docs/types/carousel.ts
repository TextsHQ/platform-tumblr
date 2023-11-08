import { FollowedTag } from './tag';
import {
  CarouselBlogElement,
  CarouselElement,
  CarouselTagElement,
  CarouselTimelineObject,
  TimelineDisplayMode,
} from './timeline';
import { VideoHub } from './video-hub';

export interface CarouselProps<
  T extends CarouselElement = CarouselBlogElement | FollowedTag | CarouselTagElement | VideoHub,
> {
  timelineObject: CarouselTimelineObject<T>;
  displayMode?: TimelineDisplayMode;
}

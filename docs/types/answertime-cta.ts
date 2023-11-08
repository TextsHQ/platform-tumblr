import { APILink } from './api-link';
import { TimelineObject } from './timeline';

enum AnswertimeStatus { // eslint-disable-line no-restricted-syntax
  PreLive = 0,
  Live = 1,
  FinishedGoToAnswers = 2,
  FinishedGoToExplore = 3,
}

interface CTAActionLink {
  tap: APILink;
}

export interface AnswertimeCTA extends TimelineObject {
  name: string;
  description: string;
  imageUrl: string;
  overallAction: CTAActionLink;
  status?: AnswertimeStatus;
  askAction?: CTAActionLink;
  answersAction?: CTAActionLink;
}

import { Timeline } from './timeline';

// This allows us to pass this around as a type into generatePath methods
export type NakedTimelineParams = {
  /**
   * Param that we use to indicate from the parent caller that the entire timeline that we should be mounting
   * has changed. Most times, this is handled by our route. However, within the naked timeline route, the only way to
   * know if this changes is based on the match param value, which we don't want to be doing for all of
   * our wrapped timelines and we want to let the caller handle it. We just need to know that we should regenerate
   * the endpoint fetch as a result of this changing.
   */
  timelineName: string;
};

export interface NakedTimelineState {
  shouldRenderError?: boolean;
  timeline: Timeline;
}

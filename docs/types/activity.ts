import { Blog } from './blog';
import { Chiclet } from './posts';

// This allows us to pass this around as a type into generatePath methods
export type ActivityParams = {
  range?: ActivityStatsRange;
  granularity?: ActivityStatsGranularity;
  graph?: ActivityStatsGraph;
  blogName: string;
};

export type UnknownActivityParams = {
  param1?: ActivityStatsGranularity | ActivityStatsGraph | ActivityStatsRange;
  param2?: ActivityStatsGranularity | ActivityStatsGraph | ActivityStatsRange;
};

export type ActivityCriteriaParams = Omit<ActivityParams, 'blogName'> & UnknownActivityParams;

export interface ActivityStats {
  startTime: number;
  endTime: number;
  range: ActivityStatsRange;
  granularity: ActivityStatsGranularity;
  timezone: string;
  topPost?: ActivityTopPost;
  sparkline: ActivityPoint[];
  newFollowers: number;
  totalFollowers: number;
  biggestFans: Blog[];
  newNotes: number;
}

export interface ActivityPoint {
  ts: number; // Seconds
  count: number;
  topPost?: ActivityTopPostPoint;
}

export enum ActivityStatsRange { // eslint-disable-line no-restricted-syntax
  Day = 'day',
  ThreeDays = 'threedays',
  Week = 'week',
  Month = 'month',
}

export const isActivityStatsRange = (range: string): range is ActivityStatsRange =>
  ['day', 'threedays', 'week', 'month'].includes(range);

export enum ActivityStatsGranularity { // eslint-disable-line no-restricted-syntax
  Hourly = 'hourly',
  Daily = 'daily',
  Sum = 'sum',
}

export const isActivityStatsGranularity = (
  granularity: string,
): granularity is ActivityStatsGranularity => ['hourly', 'daily', 'sum'].includes(granularity);

export type ActivityStatsGraph =
  | 'notes'
  | 'total'
  | 'new';

export const isActivityStatsGraph = (graph: string): graph is ActivityStatsGraph =>
  (['new', 'notes', 'total'] satisfies ActivityStatsGraph[] as string[]).includes(graph);

interface ActivityTopPostPoint {
  postId: string;
  count: number;
  post: Chiclet;
}

interface ActivityTopPost {
  postId: string;
  noteCount: number;
  totalCount: number;
  post: Chiclet;
}

import { KrakenInfo } from './logging';

export default interface AnalyticsInfo { // eslint-disable-line import/no-default-export
  automattic?: {
    id: string;
  };
  ads?: {
    hashedUserId: string;
  };
  kraken?: KrakenInfo;
}

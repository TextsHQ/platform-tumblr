import { DashboardTabId } from './dashboard';

export interface Tab {
  description: string;
  id: DashboardTabId;
  index: number;
  isHidden: boolean;
  isHideable: boolean;
  isMoveable: boolean;
  isPinnable?: boolean;
  isSponsored?: boolean;
  isNew?: boolean;
  loggingId: string;
  timelineUri: string;
  title: string;
}

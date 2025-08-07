import { SubmittedChargesHistoryData } from './index.ts';

export interface GroupedChargesHistory {
  [timestamp: string]: SubmittedChargesHistoryData[];
}

import { Mode } from './index';
import { Consult as ConsultData } from './ConsultsTrackingTable.types';
export interface LocationState {
  consults: ConsultData | null;
  mode: Mode;
}

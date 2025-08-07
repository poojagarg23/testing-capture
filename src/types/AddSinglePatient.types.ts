import type { Patient } from './Patient.types';
import type { Mode, SubMode } from './index';

export interface AddSinglePatientLocation {
  state?: {
    patient?: Patient;
    mode?: Mode;
    activeTab?: string;
    autoFillChoice?: boolean | null;
  };
}

export interface AddSinglePatientProps {
  location: AddSinglePatientLocation;
  subMode: SubMode;
}

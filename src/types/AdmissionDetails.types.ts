import type { Patient } from './Patient.types';
import type { Mode, SubMode } from './index';

export interface AdmissionDetailsProps {
  patient: Patient;
  subMode: SubMode;
  mode: Mode;
  onBack: () => void;
}

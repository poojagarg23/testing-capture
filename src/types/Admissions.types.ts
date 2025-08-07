import type { Patient } from './Patient.types';
import type { SubMode } from './index';

export interface AdmissionsProps {
  patient: Patient;
  subMode: SubMode;
}

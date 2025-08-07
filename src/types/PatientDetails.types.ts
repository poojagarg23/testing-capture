import type { Patient } from './Patient.types';
import type { Diagnosis, Mode, SubMode } from './index';

export interface PatientDetailsProps {
  patient: Patient;
  subMode: SubMode;
  mode: Mode;
  selectedDiagnosisProps?: Diagnosis[];
  autoFillChoice?: boolean;
  onClose?: () => void;
  onRefetch?: () => void;
}

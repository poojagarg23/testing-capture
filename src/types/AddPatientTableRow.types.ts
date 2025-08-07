import { Patient } from './Patient.types';

export interface AddPatientTableRowProps {
  patient: Patient;
  isSelected: boolean;
  onSelectChange: (_id: number, _checked: boolean) => void;
}

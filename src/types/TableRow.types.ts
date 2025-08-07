import { Patient } from './Patient.types';

export interface TableRowProps {
  patient: Patient;
  isEditMode: boolean;
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
}

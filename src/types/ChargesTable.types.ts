import { Patient } from './Patient.types';
import { VisitCode, SharedVisit } from './index';

export interface ChargesTableProps {
  isAllSelected: boolean;
  setIsAllSelected: (isSelected: boolean) => void;
  setSelectedPatients: (patients: Patient[]) => void;
  patients: Patient[];
  selectedPatients: Patient[];
  isEditMode?: boolean;
  visitCodes?: VisitCode[];
  sharedVisitUsers?: SharedVisit[];
  setPatients?: React.Dispatch<React.SetStateAction<Patient[]>>;
}

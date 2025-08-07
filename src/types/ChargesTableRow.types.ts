import { Patient } from './Patient.types.ts';

export interface ChargesTableProps {
  patient: Partial<Patient>;
  onSelect: (selected: boolean) => void;
  isSelected: boolean;
}

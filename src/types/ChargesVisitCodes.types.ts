import { Patient } from './Patient.types';

export interface ChargesVisitCodesProps {
  setShowModal: (show: boolean) => void;
  selectedPatients: Patient[];
  reRenderPatients: (message: string) => void;
}

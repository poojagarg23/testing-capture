import { Patient } from './Patient.types';

export interface ChargesSharedVisitProps {
  setShowModal: (_show: boolean) => void;
  selectedPatients: Patient[];
  reRenderPatients: (_message: string) => void;
}

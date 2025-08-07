import type { Diagnosis, VisitCode, SharedVisit, Provider, Hospital } from './index';

export type PatientSubMode = 'view' | 'edit';

export interface Patient {
  id: number;
  admission_id?: number;
  patient_id: number;
  firstname: string;
  lastname: string;
  middlename: string | null;
  gender: string | null;
  dateofbirth: Date | string | null;
  room: string | null;
  hospital: Hospital;
  hospital_id: number;
  owning_provider_name: string;
  hospital_abbreviation: string;
  amd_hospital_id: number | null;
  owning_provider_id: number | null;
  hospital_name: string;
  admitdate: Date | string | null;
  dischargedate?: Date | string | null;
  visittype: string;
  status?: string | null;
  facesheetalias?: string | null;
  location?: Hospital | null;
  diagnoses: Diagnosis[];
  visit_codes?: VisitCode[];
  shared_visits?: SharedVisit[];
  selectedDiagnosis?: Diagnosis[];
  has_note?: boolean;
  amd_patient_id?: string;
  charges_page_id?: number;
  chartnumber?: string;
  order_no?: number;
  owning_provider_firstname?: string;
  owning_provider_lastname?: string;
  provider: Provider;
  patient_charges_history_id?: number;
  current_user_amd_provider_id?: string;
}

export interface AddMultiplePatientsProps {
  patients: Patient[];
  owningProvider?: number;
  onClose?: () => void;
  onRefetch?: () => void;
}

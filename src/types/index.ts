export interface UserData {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  title: string;
  division: string;
  profile_pic?: string;
  street: string;
  city: string;
  state: string;
  zipcode: string;
  company_name: string;
  phone: string;
  country_code?: string;
  profile_pic_url?: string;
}

export interface Hospital {
  id: number;
  abbreviation: string;
  hospital: string;
  amd_hospital_id: number;
}

export interface Provider {
  id: number;
  firstname: string;
  lastname: string;
  title: string;
  amd_provider_id: number;
}

export interface Diagnosis {
  id: number;
  code: string;
  description: string;
  is_primary: boolean;
}

export interface VisitCode {
  visit_code: string;
  description?: string;
  id?: number;
  use?: string;
  category?: string;
}

export interface SharedVisit {
  name: string;
  id?: number;
  amd_provider_id?: string;
}

export interface OutletContextType {
  userData: UserData;
}

export interface SubmittedChargesHistoryData {
  admission_id: number;
  admitdate: string;
  amd_visit_id: string;
  charges_provider_full_name: string;
  charges_provider_id: number;
  created_at: string;
  date_of_service: string;
  diagnoses: Diagnosis[];
  facesheetalias: string | null;
  firstname: string;
  hospital_abbreviation: string;
  hospital_id: number;
  id: number;
  lastname: string;
  name_of_user: string;
  patient_id: number;
  shared_visits: SharedVisit[];
  status: string;
  timestamp: string;
  updated_at: string;
  user_id: number;
  visit_codes: VisitCode[];
  visittype: string;
  middlename: string | null;
  patient_charges_history_id?: number;
}

export interface PatientNote {
  id?: number;
  patient_id?: number;
  admitdate?: string;
  date_of_service?: string;
  macro_mate_clinical_text?: string;
  add_to_charges?: boolean;
  admission_id?: number;
  visit_codes?: VisitCode[];
  diagnoses?: Diagnosis[];
  shared_visits?: SharedVisit[];
  provider_fullname?: string;
  created_at?: string;
  user_id?: number;
  patient_notes_id?: number;
}

export type Mode = 'add' | 'view&edit';
export type SubMode = 'view' | 'edit' | 'addMultiplePatients';

export interface NavigateFunction {
  (_path: string): void;
}

export type Title = 'Physician' | 'Nurse Practitioner' | "Physician's Assistant";

export interface AttachSharedVisitPayload {
  patientId?: number;
  sharedVisitId?: number[] | null;
  charges_page_id?: number;
  admission_id: number;
}

export interface PatientChargeUpdate {
  patientId?: number;
  chargesId: number | null;
  charges_page_id: number;
  admission_id: number;
}

export interface CustomWindow extends Window {
  MSStream?: unknown;
}

export interface Appointment {
  text: string;
  start_date: string;
  end_date: string;
  id: string;
  classname: string;
  hospitalId: string;
}

export interface JwtPayload {
  email: string;
  user_id: number;
  name: string;
  hasElevatedAccess: boolean;
  isAdmin: boolean;
}

export interface QueryItem {
  query: string;
}

export interface DetailedDiagnosis {
  physician_diagnosis: string;
  previous_codes_id?: number;
  notes: string;
  best_guess_codes: Diagnosis[];
  queries: QueryItem[];
  assigned_icd_diagnosis: {
    id: number;
    code: string;
    description: string;
    is_primary: boolean;
  };
}

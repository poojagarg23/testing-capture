import type { Patient } from './Patient.types';
import type { VisitCode, SharedVisit } from './index';

export interface SubmittedChargePatient extends Patient {
  admission_id: number;
  amd_visit_id: string;
  charges_provider_full_name: string;
  charges_provider_id: number;
  created_at?: string;
  date_of_service: string;
  name_of_user: string;
  shared_visits: SharedVisit[];
  status: string;
  timestamp: string;
  updated_at?: string;
  user_id: number;
  visit_codes: VisitCode[];
  submitter_firstname?: string;
  submitter_lastname?: string;
  submitter_title?: string;
}

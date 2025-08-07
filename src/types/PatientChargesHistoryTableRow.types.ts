import { SharedVisit, VisitCode } from './index.ts';

export interface PatientChargeHistoryProps {
  date_of_service: string;
  admitdate: string;
  hospital_abbreviation: string;
  visit_codes: VisitCode[];
  shared_visits: SharedVisit[];
  name_of_user: string;
  timestamp: string;
}

export interface PatientChargesHistoryTableRowProps {
  history: PatientChargeHistoryProps;
}

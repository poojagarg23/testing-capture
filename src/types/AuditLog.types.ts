import type { Patient } from './Patient.types';

export interface AuditLogEntry {
  id: number;
  action_type: string;
  description: string;
  created_at: string;
  user_name: string;
  patient_id: number;
}

export interface AuditLogProps {
  patient: Patient | undefined;
}

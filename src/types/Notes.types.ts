import { Diagnosis, Mode, PatientNote, SubMode } from './index.ts';
import { Patient } from './Patient.types.ts';

export interface NotesProps {
  patient: Patient;
  subMode: SubMode;
}
export interface NoteProps {
  patient?: Partial<Patient> | null;
  mode?: Mode;
  currentPatientNote?: PatientNote | null;
  redirectToNotelist?: () => void;
  onBack?: () => void;
  /** Determines whether the note should be editable ("edit") or view-only ("view", "addMultiplePatients"). */
  subMode?: SubMode;
}

export interface NoteFormProps {
  patient: Patient;
  mode: Mode;
  currentPatientNote?: PatientNote | null;
  macroMateText?: string;
  redirectToNotelist: () => void;
  /** Indicates current sub mode to toggle between editable and read-only states */
  subMode?: SubMode;
}

export interface AdmissionDetail {
  admitdate: string;
  diagnoses: Diagnosis[];
  admission_id: number;
}

export interface CreatePatientNoteParams {
  patient_id: number;
  admitdate: string;
  date_of_service: string;
  macro_mate_clinical_text?: string;
}

export interface UpdatePatientNoteParams {
  id: number;
  date_of_service: string;
  admitdate: string;
  macro_mate_clinical_text?: string;
}

export interface SavePatientDiagnosesParams {
  admission_id: number;
  selectedDiagnosis: Diagnosis[];
}

export interface SaveNoteRelationshipsParams {
  patient_note_id?: number;
  diagnoses: Diagnosis[];
  charges: number[];
  shared_visits: number[];
}

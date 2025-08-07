import { getTokenFromLocalStorage } from '../../index.ts';
import { BASE_API_URL } from '../../../constants/index.ts';
import { PatientNote } from '../../../types/index.ts';
import {
  AdmissionDetail,
  CreatePatientNoteParams,
  SaveNoteRelationshipsParams,
  SavePatientDiagnosesParams,
  UpdatePatientNoteParams,
} from '../../../types/Notes.types.ts';

export const fetchLatestAdmissionDetail = async (patientId: number): Promise<AdmissionDetail> => {
  const response = await fetch(
    `${BASE_API_URL}/admission/latest-admission?patient_id=${patientId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getTokenFromLocalStorage()}`,
      },
    },
  );

  const data = await response.json();
  return data;
};

export const getAllAdmitDates = async (patientId: number): Promise<string[]> => {
  const response = await fetch(
    `${BASE_API_URL}/admission/admissions/admit-dates?patient_id=${patientId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getTokenFromLocalStorage()}`,
      },
    },
  );

  const data = await response.json();
  return data;
};

export const createPatientNote = async ({
  patient_id,
  admitdate,
  date_of_service,
  macro_mate_clinical_text,
}: CreatePatientNoteParams): Promise<{ patient_notes_id: number }> => {
  const response = await fetch(`${BASE_API_URL}/notes/patient-notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
    body: JSON.stringify({ patient_id, admitdate, date_of_service, macro_mate_clinical_text }),
  });

  if (!response.ok) {
    throw new Error('Failed to create note.');
  }

  const data = await response.json();
  return data;
};

export const updatePatientNote = async ({
  id,
  date_of_service,
  admitdate,
  macro_mate_clinical_text,
}: UpdatePatientNoteParams): Promise<PatientNote> => {
  const response = await fetch(`${BASE_API_URL}/notes/patient-notes/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
    body: JSON.stringify({ date_of_service, admitdate, macro_mate_clinical_text }),
  });

  const data = await response.json();
  return data;
};

export const savePatientDiagnoses = async ({
  admission_id,
  selectedDiagnosis,
}: SavePatientDiagnosesParams): Promise<Response> => {
  const response = await fetch(`${BASE_API_URL}/diagnoses/patient-diagnoses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
    body: JSON.stringify({ admission_id, selectedDiagnosis }),
  });

  return response;
};

export const saveNoteRelationships = async ({
  patient_note_id,
  diagnoses,
  charges,
  shared_visits,
}: SaveNoteRelationshipsParams): Promise<Response> => {
  const response = await fetch(`${BASE_API_URL}/notes/patient-notes-relationships`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
    body: JSON.stringify({ patient_note_id, diagnoses, charges, shared_visits }),
  });

  return response;
};

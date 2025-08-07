import { getTokenFromLocalStorage } from '../../index.js';
import { BASE_API_URL } from '../../../constants/index.ts';
import { Patient } from '../../../types/Patient.types.ts';

export const setPatientOrder = async (newRows: Patient[]) => {
  await fetch(`${BASE_API_URL}/charges/set-patient-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
    body: JSON.stringify({
      patientOrder: newRows.map((patient: Patient, index: number) => ({
        patient_id: patient.patient_id,
        order_no: index,
      })),
    }),
  });
};

import { getTokenFromLocalStorage } from '../../index.js';
import { BASE_API_URL } from '../../../constants/index.ts';
import { SubmittedChargesHistoryData } from '../../../types/index.ts';

export const fetchSubmittedChargesHistory = async () => {
  const response = await fetch(`${BASE_API_URL}/charges/submitted-charges-history`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
  });

  const data = await response.json();
  return data;
};

export const fetchPatientChargesHistory = async (patientsData: SubmittedChargesHistoryData[]) => {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getTokenFromLocalStorage()}`,
  };

  const promises = patientsData.map((patient: SubmittedChargesHistoryData) => {
    const url = `${BASE_API_URL}/charges/patient-charges-history?patient_charges_history_id=${patient.patient_charges_history_id}&patientId=${patient.patient_id}`;
    return fetch(url, { method: 'GET', headers });
  });

  const responses = await Promise.all(promises);
  const data = await Promise.all(responses.map((res) => res.json()));
  const flattenedData = data.flatMap((array) => array);
  const uniqueData = [...new Set(flattenedData)];

  return uniqueData;
};

import { getTokenFromLocalStorage } from '../..';
import { BASE_API_URL } from '../../../constants/index.ts';

export const fetchPatientChargesHistory = async (patientId: number) => {
  const res = await fetch(
    `${BASE_API_URL}/charges/patient-charges-history?patientId=${patientId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getTokenFromLocalStorage()}`,
      },
    },
  );

  const data = await res.json();
  return data;
};

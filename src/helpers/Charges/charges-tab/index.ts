import { getTokenFromLocalStorage } from '../../index.js';
import { BASE_API_URL } from '../../../constants/index.ts';
import { Patient } from '../../../types/Patient.types.ts';

export const fetchChargesPatientsList = async () => {
  const response = await fetch(`${BASE_API_URL}/charges/charges-patients-list`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching charges patients list. Status: ${response.status}`);
  }

  return await response.json();
};

export const deleteMultipleChargesPatients = async (selectedPatients: Patient[]) => {
  const promiseArray = selectedPatients.map((patient: Patient) =>
    fetch(`${BASE_API_URL}/charges/charges-patients-list`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getTokenFromLocalStorage()}`,
      },
      body: JSON.stringify({ admission_id: patient.id }),
    }),
  );

  return Promise.all(promiseArray);
};

export const deletePatientOrders = async (arrayofpaitentsid: number[]) => {
  const response = await fetch(`${BASE_API_URL}/charges/delete-patient-order`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
    body: JSON.stringify({ arrayofpaitentsid }),
  });

  return response;
};

export const addPatientChargesHistory = async (selectedPatients: Patient[], date: string) => {
  const timestamp = new Date().toISOString();

  const promiseArray = selectedPatients.map((patient: Patient) => {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getTokenFromLocalStorage()}`,
      },
      body: JSON.stringify({
        patient,
        date_of_service: date,
        timestamp,
      }),
    };

    return fetch(`${BASE_API_URL}/charges/patient-charges-history`, requestOptions);
  });

  const responses = await Promise.all(promiseArray);
  return responses;
};

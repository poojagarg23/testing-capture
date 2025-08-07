import { getTokenFromLocalStorage } from '../index.js';
import { BASE_API_URL } from '../../constants/index.ts';

export const deleteAllPatients = async (): Promise<Response> => {
  const response = await fetch(`${BASE_API_URL}/patient/delete-all-patients`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
      'Content-Type': 'application/json',
    },
  });
  return response;
};

import { getTokenFromLocalStorage } from '../index.js';
import { BASE_API_URL } from '../../constants/index.ts';

export const fetchAdmissions = async (patient_id: number) => {
  try {
    const response = await fetch(`${BASE_API_URL}/admission/admissions?patient_id=${patient_id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching admissions data:', error);
    return null;
  }
};

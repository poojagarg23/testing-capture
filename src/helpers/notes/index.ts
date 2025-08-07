import { toast } from 'react-toastify';
import { getTokenFromLocalStorage } from '../index.js';
import { BASE_API_URL, TOAST_CONFIG } from '../../constants/index.ts';

export const fetchNotes = async (patient_id: number) => {
  try {
    const response = await fetch(`${BASE_API_URL}/notes/patient-notes?patient_id=${patient_id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      toast.error('Failed to fetch notes', TOAST_CONFIG.ERROR);
      throw new Error('Failed to fetch notes');
    }
    return response.json();
  } catch (error) {
    toast.error('error fetching notes', TOAST_CONFIG.ERROR);
    throw error;
  }
};

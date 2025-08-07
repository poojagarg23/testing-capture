import { getTokenFromLocalStorage } from '../index.js';
import { BASE_API_URL } from '../../constants/index.ts';

export const submitFeedback = async (formData: FormData) => {
  const response = await fetch(`${BASE_API_URL}/support/feedback/submit`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
    body: formData,
  });

  const data = await response.json();
  return { success: response.ok, data };
};

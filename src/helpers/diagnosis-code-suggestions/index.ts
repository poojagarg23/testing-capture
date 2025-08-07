import { getTokenFromLocalStorage } from '../index.js';
import { BASE_API_URL } from '../../constants/index.ts';
import { Diagnosis } from '../../types/index.ts';

export const handleSearch = async (description: string): Promise<Diagnosis[] | undefined> => {
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getTokenFromLocalStorage(),
    },
  };
  try {
    const response = await fetch(
      BASE_API_URL + '/diagnoses/search-diagnosis?description=' + description,
      requestOptions,
    );
    if (response.ok) {
      return response.json();
    } else {
      console.error('error');
    }
  } catch (error) {
    console.error(error);
  }
};

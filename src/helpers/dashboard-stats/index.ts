import { getTokenFromLocalStorage } from '../index.js';
import { BASE_API_URL } from '../../constants/index.ts';

export const fetchDashboardStats = async () => {
  const response = await fetch(`${BASE_API_URL}/analytics/dashboard-stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getTokenFromLocalStorage(),
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch dashboard stats: ${response.status}`);
  }

  return response.json();
};

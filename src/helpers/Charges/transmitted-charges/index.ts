import { getTokenFromLocalStorage } from '../../index.ts';
import { BASE_API_URL } from '../../../constants/index.ts';
import { SubmittedChargePatient } from '../../../types/ChargeReview.types.ts';

export const fetchTransmittedCharges = async (): Promise<SubmittedChargePatient[]> => {
  const response = await fetch(`${BASE_API_URL}/charges/all-submitted-charges?amd_submit=true`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
  });

  const data = await response.json();
  return data;
};

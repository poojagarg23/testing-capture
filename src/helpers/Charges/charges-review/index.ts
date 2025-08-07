import { toast } from 'react-toastify';
import { getTokenFromLocalStorage } from '../../index.ts';
import { BASE_API_URL, TOAST_CONFIG } from '../../../constants/index.ts';
import { Diagnosis, SharedVisit, VisitCode } from '../../../types/index.ts';
import { SubmittedChargePatient } from '../../../types/ChargeReview.types.ts';

export const fetchUserAddedCharges = async () => {
  try {
    const response = await fetch(`${BASE_API_URL}/charges/all-submitted-charges`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + getTokenFromLocalStorage(),
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.error('Error:', response.status);
      toast.error('Something went wrong', TOAST_CONFIG.ERROR);
      throw new Error('Something went wrong');
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error:', error);
      toast.error('Something went wrong', TOAST_CONFIG.ERROR);
      throw new Error('Something went wrong');
    }
  }
};

export const AMD_SubmitCharges = async (
  amd_patient_id: string,
  patient_charges_history_id: number,
  visit_codes: VisitCode[],
  diagnoses: Diagnosis[],
  shared_visits: SharedVisit[],
  current_user_amd_provider_id: string,
  amd_hospital_id: number,
  date_of_service: string,
) => {
  try {
    const amd_provider_id = current_user_amd_provider_id;

    const response = await fetch(`${BASE_API_URL}/charges/save-charges-to-amd`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + getTokenFromLocalStorage(),
      },
      body: JSON.stringify({
        amd_patient_id,
        patient_charges_history_id,
        visit_codes,
        diagnoses,
        shared_visits,
        amd_provider_id,
        amd_hospital_id,
        date_of_service,
      }),
    });

    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        message: data.message,
      };
    } else if (data.success === false) {
      return {
        success: false,
        message: data.message,
      };
    } else {
      throw new Error(data.message || 'Failed to save charges to AMD');
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: error.message || 'Error saving charges to AMD',
      };
    }
  }
};

export const deletePatientChargesRequest = async (ids: number[]) => {
  const response = await fetch(`${BASE_API_URL}/charges/patient-charges-history`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    toast.error('Failed to delete records', TOAST_CONFIG.ERROR);
  }

  return { ok: response.ok };
};

export const updatePatientChargeHistoryRequest = async (
  patient_charges_history: SubmittedChargePatient,
  updateData: Partial<SubmittedChargePatient>,
  charges_provider_id: number,
) => {
  return await fetch(`${BASE_API_URL}/charges/patient-charges-history`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
    body: JSON.stringify({
      patient_charges_history,
      ...updateData,
      charges_provider_id,
    }),
  });
};

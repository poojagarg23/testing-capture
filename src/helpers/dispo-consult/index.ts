import { getTokenFromLocalStorage } from '..';
import { BASE_API_URL } from '../../constants/index.ts';
import { DispoConsultFormData, ExecutionLogData } from '../../types/DispoConsult.types.ts';

export const saveDispoConsult = async (formData: DispoConsultFormData) => {
  const response = await fetch(`${BASE_API_URL}/dispo-consult`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getTokenFromLocalStorage(),
    },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to submit form');
  }

  return response.json();
};

export const GenerateSummary = async (formData: DispoConsultFormData | undefined) => {
  const response = await fetch(`${BASE_API_URL}/dispo-consult/generate-summary`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getTokenFromLocalStorage(),
    },

    body: JSON.stringify({ ...formData }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to submit form');
  }

  return response.json();
};

export const saveExecutionLog = async (executionLogData: ExecutionLogData) => {
  const response = await fetch(`${BASE_API_URL}/dispo-consult/execution-log`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getTokenFromLocalStorage(),
    },
    body: JSON.stringify(executionLogData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to submit form');
  }

  return await response.json();
};

export const fetchExecutionLogs = async () => {
  try {
    const response = await fetch(`${BASE_API_URL}/dispo-consult/execution-log`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + getTokenFromLocalStorage(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch execution logs');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching execution logs:', error);
    throw error;
  }
};
export const downloadPDF = async () => {
  try {
    const response = await fetch(`${BASE_API_URL}/dispo-consult/download-report-scorecard`, {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + getTokenFromLocalStorage(),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch PDF');
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'report.pdf';
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading PDF:', error);
  }
};

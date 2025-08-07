import DOMPurify from 'dompurify';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  NavigateFunction,
  Mode,
  SubMode,
  Diagnosis,
  Title,
  Provider,
  Hospital,
  VisitCode,
  SharedVisit,
  AttachSharedVisitPayload,
  PatientChargeUpdate,
  UserData,
  DetailedDiagnosis,
} from '../types/index.js';
import { Patient } from '../types/Patient.types.js';
import { JwtPayload } from '../types/index.ts';
import { jwtDecode } from 'jwt-decode';
import { formatDisplayDate, formatISODate, isDateValid } from './dateUtils';
import { TOAST_CONFIG } from '../constants/index.ts';

const apiUrl = import.meta.env.VITE_API_URL;

export const isValidJWTToken = (token: string) => {
  const tokenParts = token.split('.');
  return tokenParts.length === 3;
};

export const sanitizeToken = (token: string) => {
  return DOMPurify.sanitize(token);
};

export const encodeToken = (token: string) => {
  return btoa(token);
};

export const decodeToken = (encodedToken: string): string => {
  return atob(encodedToken);
};

export const getAuthToken = (): string | null => {
  const sessionToken = sessionStorage.getItem('token');

  if (sessionToken) {
    try {
      const decodedToken = atob(sessionToken);

      if (isValidJWTToken(decodedToken)) {
        return decodedToken;
      }
      if (isValidJWTToken(sessionToken)) {
        return sessionToken;
      }
    } catch (e) {
      console.warn('Error decoding sessionToken:', (e as Error).message);
      if (isValidJWTToken(sessionToken)) {
        return sessionToken;
      }
    }
  }

  const localToken = localStorage.getItem('token');

  if (localToken) {
    try {
      const decodedToken = atob(localToken);

      if (isValidJWTToken(decodedToken)) {
        return decodedToken;
      }
      if (isValidJWTToken(localToken)) {
        return localToken;
      }
    } catch (e) {
      console.warn('Error decoding localToken:', (e as Error).message);
      if (isValidJWTToken(localToken)) {
        return localToken;
      }
    }
  }

  return null;
};

export const getTokenFromLocalStorage = (): string | null => {
  return getAuthToken();
};

export const storeTokenInStorage = (token: string, rememberMe: boolean = false): void => {
  if (!token) {
    return;
  }

  try {
    if (!isValidJWTToken(token)) {
      console.error('Invalid JWT token structure');
      return;
    }

    // Sanitize the token value
    const sanitizedToken = sanitizeToken(token);

    // Encode the token (optional)
    const encodedToken = encodeToken(sanitizedToken);

    // Store in appropriate storage based on rememberMe
    if (rememberMe) {
      localStorage.setItem('token', encodedToken);
      sessionStorage.removeItem('token');
    } else {
      sessionStorage.setItem('token', encodedToken);
      localStorage.removeItem('token');
    }
  } catch (error) {
    console.error('Error storing token:', error);
    if (rememberMe) {
      localStorage.setItem('token', token);
      sessionStorage.removeItem('token');
    } else {
      sessionStorage.setItem('token', token);
      localStorage.removeItem('token');
    }
  }
};

export const storeTokenInLocalStorage = (token: string, rememberMe: boolean = false): void => {
  storeTokenInStorage(token, rememberMe);
};

export const logout = (navigate: NavigateFunction): void => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');

  if (navigate) {
    navigate('/signin');
  }
};

export const isValidDate = (dateString: string | Date | undefined): boolean => {
  return isDateValid(dateString);
};

export const convertToCalendarSpecificDate = (dateInput: string | Date | null): string => {
  return formatISODate(dateInput);
};

export const convertToCustomDate = (dateString: string | Date | undefined): string => {
  return formatDisplayDate(dateString);
};

export const ViewCalendarDate = (dateString: string | null) => {
  return formatISODate(dateString);
};

export const getPatients = async (): Promise<Patient[]> => {
  const accessToken = getTokenFromLocalStorage();
  const response = await fetch(`${apiUrl}/patient/patients-list`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  const data = await response.json();
  return data;
};

export const capitalizeVisitType = (type: string | null | undefined): string => {
  if (!type) return '';
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
};

export function capitalizeNames(
  firstname: string | undefined,
  lastname: string | undefined,
): string {
  const capitalizeFirstLetter = (str: string): string =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  const capitalizedFirstName = firstname ? capitalizeFirstLetter(firstname) : '';
  const capitalizedLastName = lastname ? capitalizeFirstLetter(lastname) : '';
  return `${capitalizedLastName}, ${capitalizedFirstName}`;
}

export const setupInactivityTimer = (navigate: NavigateFunction) => {
  let inactivityTimeout: ReturnType<typeof setTimeout>;
  const TIMEOUT_DURATION = 60 * 60 * 1000; // 15 minutes in milliseconds

  const resetTimer = () => {
    clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(() => {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      navigate('/signin');
    }, TIMEOUT_DURATION);
  };

  const events: string[] = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

  events.forEach((event) => {
    document.addEventListener(event, resetTimer);
  });

  resetTimer();

  // Cleanup function
  return () => {
    events.forEach((event) => {
      document.removeEventListener(event, resetTimer);
    });
    clearTimeout(inactivityTimeout);
  };
};

export const handleDates = (date: string | null, mode: Mode, subMode: SubMode) => {
  // Standardize date handling regardless of mode
  if (!date) return '';

  // For edit modes, return ISO format for input fields
  if (
    (mode === 'view&edit' && subMode === 'edit') ||
    (mode === 'add' && subMode === 'addMultiplePatients') ||
    (mode === 'add' && subMode === 'edit')
  ) {
    return formatISODate(date);
  }

  // For view modes, return display format
  if ((mode === 'view&edit' && subMode === 'view') || (mode === 'add' && subMode === 'view')) {
    return formatDisplayDate(date);
  }

  // Default fallback
  return formatDisplayDate(date);
};

export const fetchPatientDiagnoses = async (
  admission_id: number,
): Promise<Diagnosis[] | unknown> => {
  try {
    const response = await fetch(
      `${apiUrl}/diagnoses/patient-diagnoses?admission_id=${admission_id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + getTokenFromLocalStorage(),
        },
      },
    );
    if (response.ok) {
      const data: Diagnosis[] = await response.json();
      return data;
    } else {
      console.error('Error:', response.status);
    }
  } catch (error: unknown) {
    return error;
  }
};

export const saveDiagnosis = async (
  admission_id: number,
  selectedDiagnosis: Diagnosis[],
): Promise<boolean> => {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ' + getTokenFromLocalStorage(),
  };
  const requestOptions = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ admission_id, selectedDiagnosis }),
  };

  const response = await fetch(`${apiUrl}/diagnoses/patient-diagnoses`, requestOptions);
  if (response.ok) {
    return true;
  } else {
    console.error('Error:', response.status);
    return false;
  }
};

export const addPatient = async (
  id: number,
  firstname: string,
  lastname: string,
  middlename: string | null,
  gender: string | null,
  dateofbirth: string | Date | null,
  room: string | null,
  hospital: Hospital,
  admitdate: string | Date | null,
  dischargedate: string | Date | null,
  visittype: string,
  status: string | null,
  facesheetalias: string | null,
  provider: Provider,
  createAdmission: boolean = false,
): Promise<Response> => {
  const formData = new URLSearchParams();
  formData.append('id', id.toString());
  if (firstname) formData.append('firstname', firstname);
  if (lastname) formData.append('lastname', lastname);
  if (middlename) formData.append('middlename', middlename);
  if (gender) formData.append('gender', gender);
  if (dateofbirth) formData.append('dateofbirth', formatISODate(dateofbirth));
  if (room) formData.append('room', room);
  if (hospital) {
    formData.append('hospital_id', hospital.id.toString());
    formData.append('amd_hospital_id', hospital.amd_hospital_id.toString());
    formData.append('hospitalfacilityname', hospital.hospital.toString());
  }
  if (admitdate) formData.append('admitdate', formatISODate(admitdate));
  if (dischargedate)
    formData.append('dischargedate', dischargedate ? formatISODate(dischargedate) : '');
  if (visittype) formData.append('visittype', visittype);
  if (status) formData.append('status', status);
  if (facesheetalias) formData.append('facesheetalias', facesheetalias);
  if (createAdmission) formData.append('create_admission', 'true');
  if (provider) {
    formData.append('owning_provider_id', provider.id.toString());
    formData.append(
      'amd_provider_id',
      provider.amd_provider_id === null ? '' : provider.amd_provider_id.toString(),
    );
  }
  const response = await fetch(`${apiUrl}/patient/add-patient`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Bearer ' + getTokenFromLocalStorage(),
    },
    body: formData.toString(),
  });

  return response;
};

export const addPatientIdToChargesPage = async (admission_id: number): Promise<Response> => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
    body: JSON.stringify({ admission_id }),
  };

  const response = await fetch(`${apiUrl}/charges/charges-patients-list`, requestOptions);
  return response;
};

export const extractAgeFromDob = (dob: string | Date): number => {
  const dobDate = new Date(dob);
  const today = new Date();
  const age = today.getFullYear() - dobDate.getFullYear();
  const monthDiff = today.getMonth() - dobDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
    return age - 1;
  }
  return age;
};

export const checkAccessPassword = (): boolean => {
  const userInput: string | null = prompt('Please enter access password:');
  if (userInput === '777333') {
    return true;
  }
  return false;
};

export const columnWidths = {
  checkbox: '40px',
  name: '50px',
  facilityName: '50px',
  roomNumber: '50px',
  dob: '50px',
  dateRequested: '50px',
  timeRequested: '50px',
  visitDate: '50px',
  followupDate: '50px',
  assignedProvider: '50px',
  insuranceCarrier: '50px',
  rehabDiagnosis: '50px',
  rehabRecs: '50px',
  notes: '50px',
  status: '50px',
};

export const updateCommonPatientDetails = async (
  patient: Patient,
  old_patient_data: Patient,
  forceUpdate: boolean = false,
): Promise<Patient | string> => {
  const {
    patient_id,
    firstname,
    lastname,
    middlename,
    dateofbirth,
    gender,
    status,
    amd_patient_id,
  } = patient;

  if (!patient_id) {
    toast.error('Patient ID is required', TOAST_CONFIG.ERROR);
    throw new Error('patient_id is required');
  }

  const requestBody = {
    patient_id,
    firstname,
    lastname,
    middlename,
    dateofbirth,
    gender,
    status,
    amd_patient_id,
    old_patient_data,
    forceUpdate,
  };

  try {
    const response = await fetch(`${apiUrl}/patient/update-common-patient-details`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getTokenFromLocalStorage()}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data?.details && data.details.code === '-2147217398') {
        return data.details.code;
      }
      toast.error(data.error || 'Failed to update patient details', TOAST_CONFIG.ERROR);
      return data;
    }

    toast.success('Patient details updated successfully', TOAST_CONFIG.SUCCESS);
    return data;
  } catch (error) {
    toast.error('An error occurred while updating patient details', TOAST_CONFIG.ERROR);
    throw error;
  }
};

export const authorizedTitles: string[] = [
  'Physician',
  'Nurse Practitioner',
  "Physician's Assistant",
];

export const getTitlePrefix = (title: string | undefined): string => {
  const prefixes: Record<Title, string> = {
    Physician: 'Dr.',
    'Nurse Practitioner': 'NP',
    "Physician's Assistant": 'PA',
  };
  return prefixes[title as Title] || '';
};

export const formatProviderName = (provider: Provider): string => {
  const prefix = getTitlePrefix(provider.title);
  if (provider.title === 'Physician') {
    return `${prefix} ${provider.firstname} ${provider.lastname}`;
  }
  return `${provider.firstname} ${provider.lastname}, ${prefix}`;
};

export const titleToDivision: Record<string, string> = {
  Physician: 'Clinical',
  'Nurse Practitioner': 'Clinical',
  "Physician's Assistant": 'Clinical',
  Operations: 'Business Strategy & Operations',
  'IT Admin': 'Engineering',
  'Hospital Staff': 'Other',
} as const;

export const handleNotificationSetting = async (
  type: string,
  setState: React.Dispatch<React.SetStateAction<boolean>>,
  isAllow: boolean,
) => {
  try {
    const serviceValue = !isAllow;
    await fetch(`${apiUrl}/profile/notifications/${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getTokenFromLocalStorage()}`,
      },
      body: JSON.stringify({ value: serviceValue }),
    });

    setState((prev: boolean) => !prev);
    const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
    const active = serviceValue ? 'Enabled' : 'Disabled';
    toast.success(`${capitalizedType} Service ${active}`, TOAST_CONFIG.SUCCESS);
  } catch (error) {
    console.error('Failed to update notification setting:', error);
    toast.error('Network error', TOAST_CONFIG.ERROR);
  }
};

export const handleSubmit = async (fromWorkHours: string, toWorkHours: string) => {
  try {
    await fetch(`${apiUrl}/profile/workhours`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getTokenFromLocalStorage()}`,
      },
      body: JSON.stringify({ work_from_hours: fromWorkHours, to_work_hours: toWorkHours }),
    });

    toast.success('Work Hours Added', TOAST_CONFIG.SUCCESS);
  } catch (e) {
    console.error(e);
  }
};

export const getNotificationSetting = async (
  setEmail: React.Dispatch<React.SetStateAction<boolean>>,
  setSms: React.Dispatch<React.SetStateAction<boolean>>,
  setFromWorkHour: React.Dispatch<React.SetStateAction<string>>,
  setToWorkHour: React.Dispatch<React.SetStateAction<string>>,
) => {
  try {
    const response = await fetch(`${apiUrl}/profile/notifications`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`,
      },
    });

    const { data } = await response.json();
    data.forEach(
      (setting: {
        email_notification: boolean;
        sms_notification: boolean;
        work_from_hours: string;
        to_work_hours: string;
      }) => {
        setEmail(setting.email_notification);
        setSms(setting.sms_notification);
        setFromWorkHour(setting.work_from_hours);
        setToWorkHour(setting.to_work_hours);
      },
    );
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    toast.error('Network error', TOAST_CONFIG.ERROR);
  }
};

export const fetchHospitals = async (): Promise<Hospital[]> => {
  const response = await fetch(`${apiUrl}/facilities/hospitals`, {
    headers: {
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
  });
  if (response.ok) {
    const data = await response.json();
    return data;
  }
  return [];
};

export const fetchAuthorizedProviders = async (): Promise<Provider[]> => {
  const response = await fetch(`${apiUrl}/facilities/authorized-providers`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch authorized providers');
  }
  return response.json();
};

export const fetchVisitCodes = async (): Promise<VisitCode[]> => {
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
  };
  const response = await fetch(`${apiUrl}/charges/visit-codes`, requestOptions);
  if (!response.ok) {
    throw new Error('Failed to fetch visit codes');
  }
  return response.json();
};

export const fetchSharedVisitUsers = async (): Promise<SharedVisit[]> => {
  const requestOptions = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
  };

  const response = await fetch(`${apiUrl}/charges/user-shared-visits`, requestOptions);
  if (!response.ok) {
    throw new Error('Failed to fetch shared visit users');
  }
  return response.json();
};

export const updatePatientOrder = (patientIds: number[]) => {
  return fetch(`${apiUrl}/charges/update-patient-order`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
    body: JSON.stringify({ arrayOfPatientsId: patientIds }),
  });
};

export const attachSharedVisitsToAdmission = async (
  idsArray: AttachSharedVisitPayload[],
): Promise<Response> => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
    body: JSON.stringify({ ids_array: idsArray }),
  };

  const response = await fetch(
    `${apiUrl}/charges/attach-shared-visits-to-admission-id`,
    requestOptions,
  );

  if (!response.ok) {
    throw new Error('Failed to attach shared visits to admission ID');
  }

  return response;
};

export const updatePatientCharges = (ids_array: PatientChargeUpdate[]) => {
  const requestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
    body: JSON.stringify({ ids_array }),
  };
  return fetch(`${apiUrl}/charges/patient-charges`, requestOptions);
};

export const convertNotes = async (
  notesInput: string,
): Promise<{
  diagnoses: Diagnosis[];
  detailed_diagnoses: DetailedDiagnosis[];
  documentation_improvement_opportunities: string;
}> => {
  const response = await fetch(`${apiUrl}/notes/convert-notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
    body: JSON.stringify({ description: notesInput }),
  });

  if (!response.ok) {
    throw new Error('Failed to convert notes');
  }

  return response.json();
};

export const fetchUserDetails = async (): Promise<UserData> => {
  const response = await fetch(`${apiUrl}/profile/user-details`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user details');
  }

  return response.json();
};

export const deleteFacesheet = async (
  id: number,
  facesheetalias: string,
): Promise<{ success: boolean; error?: unknown }> => {
  try {
    const response = await fetch(`${apiUrl}/documents/delete-facesheet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getTokenFromLocalStorage()}`,
      },
      body: JSON.stringify({ id, facesheetalias }),
    });

    if (response.status === 200) {
      return { success: true };
    } else {
      return { success: false };
    }
  } catch (error: unknown) {
    console.error('Error deleting facesheet:', error);
    return { success: false, error };
  }
};

export const ViewFacesheet = async (
  id: number | undefined | null,
  filealias: string | null | undefined,
): Promise<string> => {
  const response = await fetch(`${apiUrl}/documents/view-file`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
    body: JSON.stringify({ id, filealias }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch signed URL');
  }

  const data: { signedUrl: string } = await response.json();
  return data.signedUrl;
};

export const uploadFacesheetApi = async (formData: FormData): Promise<Patient> => {
  const response = await axios.post(`${apiUrl}/documents/upload-facesheet`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
  });
  return response.data;
};

export const updatePatientStatus = async (
  status: string | null,
  old_patient_data: Patient,
  forceUpdate: boolean = false,
): Promise<boolean> => {
  const { patient_id, firstname, lastname, middlename, dateofbirth, gender, amd_patient_id } =
    old_patient_data;

  if (!patient_id) {
    toast.error('Patient ID is required', TOAST_CONFIG.ERROR);
    throw new Error('patient_id is required');
  }

  const requestBody = {
    patient_id,
    firstname,
    lastname,
    middlename,
    dateofbirth,
    gender,
    status,
    amd_patient_id,
    old_patient_data,
    forceUpdate,
  };

  const response = await fetch(`${apiUrl}/patient/update-common-patient-details`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error('Failed to update patient status');
  }

  return true;
};

export const submitConsultForm = async (formData: URLSearchParams): Promise<boolean> => {
  const response = await fetch(`${apiUrl}/consults/add-or-update-consult`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to submit consult');
  }

  return true;
};

export const updateConsult = async (
  consultId: number,
  changes: Record<string, string | number>,
): Promise<boolean> => {
  const payload = {
    id: consultId,
    ...changes,
  };

  try {
    const response = await fetch(`${apiUrl}/consults/add-or-update-consult`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getTokenFromLocalStorage()}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      toast.error('Failed to update consult', TOAST_CONFIG.ERROR);
      throw new Error('Failed to update consult');
    }

    toast.success('Consult updated successfully', TOAST_CONFIG.SUCCESS);
    return true;
  } catch (error) {
    toast.error('Network error occurred while updating consult', TOAST_CONFIG.ERROR);
    throw error;
  }
};

export const updateAdmitDate = async (
  admissionId: number,
  admitDate: string | Date,
): Promise<boolean> => {
  const payload = {
    admitdate: formatISODate(admitDate),
  };

  try {
    const response = await fetch(`${apiUrl}/admission/admissions/${admissionId}/admit-date`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getTokenFromLocalStorage()}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      toast.error(error.message || 'Failed to update admit date', TOAST_CONFIG.ERROR);
      throw new Error(error.message || 'Failed to update admit date');
    }
    toast.success('Admit date updated successfully', TOAST_CONFIG.SUCCESS);
    return true;
  } catch (error) {
    toast.error('An error occurred while updating the admit date.', TOAST_CONFIG.ERROR);
    throw error;
  }
};

export const fetchAuditLog = async (patientId: number) => {
  const response = await fetch(`${apiUrl}/logs/google-logs?patient_id=${patientId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getTokenFromLocalStorage()}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch audit log');
  }

  return response.json();
};

export async function submitNotesForSplit(notes: string): Promise<string[]> {
  const response = await fetch(`${apiUrl}/notes/split-diagnoses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ notes }),
  });

  if (!response.ok) {
    throw new Error('Failed to split diagnoses');
  }

  const data = await response.json();

  return data.diagnoses;
}

export const checkUserAccess = () => {
  try {
    let token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return;

    token = decodeToken(token);
    const decoded = jwtDecode<JwtPayload>(token);

    return {
      hasElevatedAccess: !!decoded.hasElevatedAccess,
      isAdmin: !!decoded.isAdmin,
    };
  } catch (error) {
    console.error('Error checking user access:', error);
  }
};

export interface Consult {
  id: string | number;
  firstname: string;
  middlename: string;
  lastname: string;
  hospital_abbreviation: string;
  hospital_id?: number | undefined;
  hospital_name?: string;
  roomnumber: string;
  dob?: string;
  daterequested?: string;
  timerequested?: string;
  visitdate?: string;
  followupdate?: string;
  notes?: string;
  status?: string;
  owning_provider_id?: string | number;
  owning_provider_name?: string;
  insurancecarrier?: string;
  rehabdiagnosis?: string;
  rehabrecs?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: string | number | undefined;
}

export interface SortOrder {
  column: string | null;
  order: 'asc' | 'desc' | null;
}

export interface Filters {
  facilityName: (string | number)[];
  assignedProvider: string[];
  status: string;
}

export interface VisibleColumns {
  name: boolean;
  facilityName: boolean;
  roomNumber: boolean;
  dob: boolean;
  dateRequested: boolean;
  timeRequested: boolean;
  visitDate: boolean;
  followupDate: boolean;
  assignedProvider: boolean;
  insuranceCarrier: boolean;
  rehabDiagnosis: boolean;
  rehabRecs: boolean;
  notes: boolean;
  status: boolean;
}

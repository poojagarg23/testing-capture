export interface Diagnosis {
  id: string;
  code: string;
  description: string;
  short_code?: string | null;
  is_primary?: boolean; // used in patient diagnoses
}

export interface FavoriteDiagnosis {
  id: string;
  code: string;
  description: string;
}

export interface ShortCode {
  id: string; // from `diagnosis` table
  code: string;
  description: string;
  diagnosis_id: string;
  short_code: string;
}

export interface AddShortCodeInput {
  id: string; // diagnosis ID
  newShortCode: string | null;
}

export interface DeleteShortCodeInput {
  diagnosis_id: string;
  short_code: string;
}

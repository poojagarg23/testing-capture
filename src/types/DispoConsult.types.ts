export interface Result {
  disposition: string;
  confidence: string;
}
export interface ExecutionLogPayload {
  ambulation_functional_level: string;
  available_social_support: string;
  insurance_payer: string;
  ot_needs: boolean;
  prior_level_of_function: string;
  prior_living_arrangement: string;
  tolerates_therapies_standing: boolean;
  transfer_functional_level: string;
  selected_option: string;
  therapy_tolerated: boolean;
  diagnosis_category: string;
  provider_recommended_disposition: string;
}

export interface DispoConsultFormData {
  disposition?: string;
  confidence?: string;
  diagnosis_category?: string;
  insurance_payer?: string;
  prior_level_of_function?: string;
  prior_living_arrangement?: string;
  available_social_support?: string;
  transfer_functional_level?: string;
  ambulation_functional_level?: string;
  ot_needs?: boolean;
  tolerates_therapies_standing?: boolean;
  primary_diagnosis?: string;
  comorbid_conditions?: string;
  patient_lives_with?: string;
  home_levels?: number | undefined;
  home_ste?: number | undefined;
  home_steps?: number | undefined;
  occupation?: string;
  driving?: boolean;
  therapy_tolerated?: boolean;
  gait_aids?: string;
  distance?: number | undefined;
  bathing?: string;
  toileting?: string;
  ubd?: string;
  lbd?: string;
  feeding?: string;
  other?: string;
  provider_recommended_disposition?: string;
  selected_option?: string;
  /* Additional fields for full form */
  age?: number;
  gender?: string;
  hospital?: import('./index').Hospital | null;
  date_of_admission?: string;
  baseline_cognition?: string;
  current_cognition?: string;
  ramp_entry?: boolean;
  disposition_goals?: string;
}

export interface ExecutionLogData extends ExecutionLogPayload {
  providerRecommendedDisposition: string;
  confidence: string;
  disposition: string;
}

export interface ExecutionLog {
  id: number | string;
  selected_option: string;
  diagnosis_category: string;
  insurance_payer: string;
  prior_level_of_function: string;
  prior_living_arrangement: string;
  available_social_support: string;
  transfer_functional_level: string;
  ambulation_functional_level: string;
  ot_needs: string;
  tolerates_therapies_standing: string;
  provider_recommended_disposition: string;
  disposition: string;
  confidence: string | number;
  provider: string;
  created_at: string;
}
export interface Option {
  name: string;
  score: number;
}
export interface FormFields {
  selectedOption: string;
  diagnosis: string;
  insurancePayerType: string;
  priorLevelOfFunction: string;
  priorLivingArrangement: string;
  availableSupport: string;
  functionalLevelTransfers: string;
  functionalLevelAmbulation: string;
  providerRecommendedDisposition: string;
}

export type FormErrors = {
  [K in keyof FormFields]: boolean;
};

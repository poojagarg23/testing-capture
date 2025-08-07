export const options = {
  gender: [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
  ],
  baselineCognition: [
    { label: 'Intact', value: 'Intact' },
    { label: 'Mild-moderately impaired', value: 'Mild-moderately impaired' },
    { label: 'Severely impaired', value: 'Severely impaired' },
    { label: 'Unable to Assess', value: 'Unable to Assess' },
  ],
  currentLocation: [
    { label: 'Chippenham Hospital', value: 'Chippenham Hospital' },
    { label: 'Johnston-Willis Hospital', value: 'Johnston-Willis Hospital' },
    { label: 'Henrico Doctors Hospital Forest', value: 'Henrico Doctors Hospital Forest' },
    { label: 'Parham Doctors Hospital', value: 'Parham Doctors Hospital' },
  ],
  currentCognition: [
    { label: 'Intact', value: 'Intact' },
    { label: 'Mild-moderately impaired', value: 'Mild-moderately impaired' },
    { label: 'Severely impaired', value: 'Severely impaired' },
    { label: 'Unable to Assess', value: 'Unable to Assess' },
  ],
  diagnosis: [
    { label: 'Amputation - LE', value: 'Amputation - LE' },
    { label: 'Amputation - UE', value: 'Amputation - UE' },
    { label: 'Burns', value: 'Burns' },
    { label: 'Cardiac', value: 'Cardiac' },
    { label: 'Congenital Deformity', value: 'Congenital Deformity' },
    { label: 'Hip/Knee Replacement', value: 'Hip/Knee Replacement' },
    { label: 'MMT w/ BSCI', value: 'MMT w/ BSCI' },
    { label: 'MMT w/o BSCI', value: 'MMT w/o BSCI' },
    { label: 'Neurological Conditions', value: 'Neurological Conditions' },
    { label: 'Non-traumatic Brain Injury', value: 'Non-traumatic Brain Injury' },
    { label: 'Non-traumatic Spinal Cord Injury', value: 'Non-traumatic Spinal Cord Injury' },
    { label: 'Orthopedic - Hip/Femur Fracture', value: 'Orthopedic - Hip/Femur Fracture' },
    {
      label: 'Orthopedic - Major Multiple Fractures',
      value: 'Orthopedic - Major Multiple Fractures',
    },
    { label: 'Orthopedic - Other', value: 'Orthopedic - Other' },
    { label: 'Other Medically Complex/Debility', value: 'Other Medically Complex/Debility' },
    {
      label: 'Polyarticular Inflammatory Arthritis',
      value: 'Polyarticular Inflammatory Arthritis',
    },
    { label: 'Pulmonary', value: 'Pulmonary' },
    { label: 'Severe/Advanced Osteoarthritis', value: 'Severe/Advanced Osteoarthritis' },
    { label: 'Stroke', value: 'Stroke' },
    { label: 'Systemic Vasculitis', value: 'Systemic Vasculitis' },
    { label: 'Traumatic Brain Injury', value: 'Traumatic Brain Injury' },
    { label: 'Traumatic Spinal Cord Injury', value: 'Traumatic Spinal Cord Injury' },
  ],
  insurancePayerType: [
    { label: 'Medicare', value: 'medicare' },
    { label: 'Medicaid', value: 'medicaid' },
    { label: 'Managed Medicare', value: 'managed_medicare' },
    { label: 'Managed Medicaid', value: 'managed_medicaid' },
    { label: 'Commercial', value: 'commercial' },
    { label: 'Uninsured', value: 'uninsured' },
  ],
  priorLevelOfFunction: [
    { label: 'Independent', value: 'independent' },
    { label: 'Mostly Independent, but Used a Device', value: 'mostly_independent_used_device' },
    {
      label: 'Needed Some Help, but Could Do Most Things Alone',
      value: 'some_help_most_things_alone',
    },
    { label: 'Needed a Lot of Help Every Day', value: 'needed_lots_help_daily' },
    { label: 'Completely Dependent on Others', value: 'completely_dependent_on_others' },
  ],
  priorLivingArrangement: [
    { label: 'Home / House / Apartment', value: 'house_home_apartment' },
    { label: 'Assisted Living Facility / SNF', value: 'assisted_living_snf' },
    { label: 'Prison', value: 'prison' },
    { label: 'Homeless', value: 'homeless' },
  ],
  availableSupport: [
    {
      label: 'Full-Time Hands-Off Help (24/7, lives with patient)',
      value: 'full_time_hands_on_help',
    },
    {
      label: 'Regular Hands-On Help (Daily, but not 24/7)',
      value: 'regular_hands_on_help_not_247',
    },
    {
      label: 'Intermittent Hands-On Help (A few times per week)',
      value: 'intermittent_hands_on_help_weekly',
    },
    {
      label: 'Intermittent Hands-Off Help (A few times per week, mostly supervision)',
      value: 'intermittent_hands_off_help',
    },
    {
      label: 'Proximity Support (Family/friends nearby)',
      value: 'proximity_support_family_friends_nearby',
    },
    { label: 'No Support', value: 'no_support' },
  ],
  functionalLevelTransfers: [
    { label: 'Dependent', value: 'dependent' },
    { label: 'Max assist', value: 'max_assist' },
    { label: 'Mod assist', value: 'mod_assist' },
    { label: 'Min assist', value: 'mis_assist' },
    { label: 'CGA', value: 'contact_guard_assist' },
    { label: 'Supervision', value: 'supervision' },
    { label: 'Independent', value: 'independent' },
  ],
  functionalLevelAmbulation: [
    { label: 'Dependent', value: 'dependent' },
    { label: 'Max assist', value: 'max_assist' },
    { label: 'Mod assist', value: 'mod_assist' },
    { label: 'Min assist', value: 'mis_assist' },
    { label: 'CGA', value: 'contact_guard_assist' },
    { label: 'Supervision', value: 'supervision' },
    { label: 'Independent', value: 'independent' },
  ],
  providerRecommendedDisposition: [
    { label: 'Home with Home Health/Outpatient', value: 'Home with Home Health/Outpatient' },
    { label: 'IRF', value: 'IRF' },
    { label: 'SNF', value: 'SNF' },
  ],
  assistanceOptions: [
    { label: 'Dependent', value: 'dependent' },
    { label: 'Max assist', value: 'max_assist' },
    { label: 'Mod assist', value: 'mod_assist' },
    { label: 'Min assist', value: 'mis_assist' },
    { label: 'CGA', value: 'contact_guard_assist' },
    { label: 'Supervision', value: 'supervision' },
    { label: 'Independent', value: 'independent' },
  ],
  medicalReadiness: [
    {
      value: 'very-close',
      label: 'Discharge Today / Imminent',
      description:
        'For patients with anticipated discharge in <24 hours — urgent planning required',
    },
    {
      value: 'few-days',
      label: ' Discharge Anticipated Soon',
      description: 'For patients nearing medical stability — disposition planning underway',
    },
    {
      value: 'not-even-close',
      label: 'Early Hospital Course',
      description: 'For patients still early or unstable — preliminary guidance only',
    },
  ],
};

export const TOAST_CONFIG = {
  SUCCESS: { autoClose: 1000 },
  ERROR: { autoClose: 2500 },
  WARNING: { autoClose: 2500 },
  INFO: { autoClose: 2500 },
};

export const BASE_API_URL = import.meta.env.VITE_API_URL;

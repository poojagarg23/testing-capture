import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { saveDispoConsult, saveExecutionLog } from '../../../helpers/dispo-consult/index.js';
import { options, TOAST_CONFIG } from '../../../constants/index.js';
import {
  DispoConsultFormData,
  ExecutionLogPayload,
  FormErrors,
  FormFields,
  Result,
  Option,
} from '../../../types/DispoConsult.types.ts';
import InputField from '../custom/InputField';
import Textarea from '../custom/Textarea';
import YesNoToggle from '../YesNoToggle';
import CustomModal from '../CustomModal';
import RehabDetailsContent from '../RehabDetailsContent';
import SpecializedCareNeeds from '../SpecializedCareNeeds';
import { fetchHospitals } from '../../../helpers/index.ts';
import { Hospital } from '../../../types/index.ts';
import { format } from 'date-fns';
import Dropdown from '../custom/Dropdown';
import Button from '../custom/Button.tsx';
import Loader from '../Loader';
import InfoIcon from '../../../assets/icons/info.svg?react';
import HoverContent from '../HoverContent.tsx';
import {
  formatISODate,
  isDateValid,
  isOlderThanNDays,
  parseDate,
} from '../../../helpers/dateUtils.ts';
import ConfirmationModal from '../ConfirmationModal.tsx';
import WarningIcon from '../../../assets/icons/Warning.svg?react';

// Extended Result interface to include allOptions
interface ExtendedResult extends Result {
  allOptions: Option[];
}

interface DispoConsultFormProps {
  onSubmitSuccess?: (data: ExtendedResult) => void;
}

// Define LabeledDropdown component at the top of the file
type LabeledDropdownProps = React.ComponentProps<typeof Dropdown> & {
  label: string;
  error?: boolean;
  required?: boolean;
};

const LabeledDropdown: React.FC<LabeledDropdownProps> = ({ label, error, required, ...props }) => (
  <div className="flex flex-col w-full">
    <label
      className={` block text-xs  2xl:text-sm font-gotham-bold text-secondary !mb-2 2xl:!mb-3 ${error && 'required'}`}
    >
      {label} {required && <span className="required">*</span>}
    </label>
    <Dropdown
      fullWidth
      variant="variant_2"
      className="text-sm 2xl:text-base"
      buttonClassName={error ? '!border-error-custom !bg-error-bg' : ''}
      disableFocus={!!error}
      optionClassName="font-gotham-medium"
      {...props}
    />
  </div>
);

const DispoConsultForm: React.FC<DispoConsultFormProps> = ({ onSubmitSuccess }) => {
  /* --------------------------------------------------------------------
   * CONSTANTS
   * ------------------------------------------------------------------*/

  // Age ranges that trigger a confirmation modal
  const AGE_MIN_WARNING = 18;
  const AGE_MAX_WARNING = 130;

  /* --------------------------------------------------------------------
   * STATE
   * ------------------------------------------------------------------*/

  // Consolidated form state
  interface FormState {
    diagnosis: string;
    gender: string;
    dateOfAdmission: string;
    insurancePayerType: string;
    priorLevelOfFunction: string;
    baselineCognition: string;
    priorLivingArrangement: string;
    dispositionGoals: string;
    availableSupport: string;
    functionalLevelTransfers: string;
    functionalLevelAmbulation: string;
    otNeeds: boolean;
    toleratesTherapiesStanding: boolean;
    providerRecommendedDisposition: string;
    primaryDiagnosis: string;
    comorbidConditions: string;
    patientLivesWith: string;
    homeLevels?: number;
    homeSTE?: number;
    homeSteps?: number;
    rampEntry: boolean;
    occupation: string;
    driving: boolean;
    therapyTolerated: boolean;
    gaitAids: string;
    distance?: number;
    age?: number;
    selectedOption: string;
    bathing: string;
    toileting: string;
    ubd: string;
    lbd: string;
    feeding: string;
    other: string;
    currentCognition: string;
    selectedHospital: Hospital | null;
  }

  const initialFormState: FormState = {
    diagnosis: '',
    gender: '',
    dateOfAdmission: '',
    insurancePayerType: '',
    priorLevelOfFunction: '',
    baselineCognition: '',
    priorLivingArrangement: '',
    dispositionGoals: '',
    availableSupport: '',
    functionalLevelTransfers: '',
    functionalLevelAmbulation: '',
    otNeeds: true,
    toleratesTherapiesStanding: true,
    providerRecommendedDisposition: '',
    primaryDiagnosis: '',
    comorbidConditions: '',
    patientLivesWith: '',
    homeLevels: undefined,
    homeSTE: undefined,
    homeSteps: undefined,
    rampEntry: true,
    occupation: '',
    driving: true,
    therapyTolerated: true,
    gaitAids: '',
    distance: undefined,
    age: undefined,
    selectedOption: '',
    bathing: '',
    toileting: '',
    ubd: '',
    lbd: '',
    feeding: '',
    other: '',
    currentCognition: '',
    selectedHospital: null,
  };

  const [form, setForm] = useState<FormState>(initialFormState);

  // UI/auxiliary states (left as separate values)
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isNext, setIsNext] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [score, setScore] = useState<string>('');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [formData, setFormData] = useState<DispoConsultFormData | undefined>();
  const [result, setResult] = useState<Result | undefined>();
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Warn user if admit date is more than 90 days old
  const [showAdmitWarning, setShowAdmitWarning] = useState<boolean>(false);
  // Show error when admission date is in the future
  const [showFutureDateError, setShowFutureDateError] = useState<boolean>(false);

  // Age confirmation modal state
  const [ageWarningType, setAgeWarningType] = useState<'under' | 'over' | null>(null);

  // Form validation error flags
  const [errors, setErrors] = useState<FormErrors>({
    selectedOption: false,
    diagnosis: false,
    insurancePayerType: false,
    priorLevelOfFunction: false,
    priorLivingArrangement: false,
    availableSupport: false,
    functionalLevelTransfers: false,
    functionalLevelAmbulation: false,
    providerRecommendedDisposition: false,
  });

  // Convenience: generic field updater
  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Back-compat setters so existing JSX remains untouched
  const setDiagnosis = (val: string | number | (string | number)[]) =>
    updateField('diagnosis', toStr(val));
  function toStr(v: string | number | (string | number)[]) {
    return Array.isArray(v) ? String(v[0] ?? '') : String(v);
  }

  const setGender = (val: string | number | (string | number)[]) =>
    updateField('gender', toStr(val));
  const setDateOfAdmission = (val: string) => updateField('dateOfAdmission', val);
  const setInsurancePayerType = (val: string | number | (string | number)[]) =>
    updateField('insurancePayerType', toStr(val));
  const setPriorLevelOfFunction = (val: string | number | (string | number)[]) =>
    updateField('priorLevelOfFunction', toStr(val));
  const setBaselineCognition = (val: string | number | (string | number)[]) =>
    updateField('baselineCognition', toStr(val));
  const setPriorLivingArrangement = (val: string | number | (string | number)[]) =>
    updateField('priorLivingArrangement', toStr(val));
  const setDispositionGoals = (val: string) => updateField('dispositionGoals', val);
  const setAvailableSupport = (val: string | number | (string | number)[]) =>
    updateField('availableSupport', toStr(val));
  const setFunctionalLevelTransfers = (val: string | number | (string | number)[]) =>
    updateField('functionalLevelTransfers', toStr(val));
  const setFunctionalLevelAmbulation = (val: string | number | (string | number)[]) =>
    updateField('functionalLevelAmbulation', toStr(val));
  const setOtNeeds = (val: boolean) => updateField('otNeeds', val);
  const setToleratesTherapiesStanding = (val: boolean) =>
    updateField('toleratesTherapiesStanding', val);
  const setProviderRecommendedDisposition = (val: string | number | (string | number)[]) =>
    updateField('providerRecommendedDisposition', toStr(val));
  const setPrimaryDiagnosis = (val: string) => updateField('primaryDiagnosis', val);
  const setComorbidConditions = (val: string) => updateField('comorbidConditions', val);
  const setPatientLivesWith = (val: string) => updateField('patientLivesWith', val);
  const setHomeLevels = (val?: number) => updateField('homeLevels', val);
  const setHomeSTE = (val?: number) => updateField('homeSTE', val);
  const setHomeSteps = (val?: number) => updateField('homeSteps', val);
  const setRampEntry = (val: boolean) => updateField('rampEntry', val);
  const setOccupation = (val: string) => updateField('occupation', val);
  const setDriving = (val: boolean) => updateField('driving', val);
  const setTherapyTolerated = (val: boolean) => updateField('therapyTolerated', val);
  const setGaitAids = (val: string) => updateField('gaitAids', val);
  const setDistance = (val?: number) => updateField('distance', val);
  const setAge = (val?: number) => updateField('age', val);
  const setSelectedOption = (val: string) => updateField('selectedOption', val);
  const setBathing = (val: string | number | (string | number)[]) =>
    updateField('bathing', toStr(val));
  const setToileting = (val: string | number | (string | number)[]) =>
    updateField('toileting', toStr(val));
  const setUbd = (val: string | number | (string | number)[]) => updateField('ubd', toStr(val));
  const setLbd = (val: string | number | (string | number)[]) => updateField('lbd', toStr(val));
  const setFeeding = (val: string | number | (string | number)[]) =>
    updateField('feeding', toStr(val));
  const setOther = (val: string | number | (string | number)[]) => updateField('other', toStr(val));
  const setCurrentCognition = (val: string | number | (string | number)[]) =>
    updateField('currentCognition', toStr(val));
  const setSelectedHospital = (val: Hospital | null) => updateField('selectedHospital', val);

  // Destructure for easier access (keeps rest of JSX unchanged)
  const {
    diagnosis,
    gender,
    dateOfAdmission,
    insurancePayerType,
    priorLevelOfFunction,
    baselineCognition,
    priorLivingArrangement,
    dispositionGoals,
    availableSupport,
    functionalLevelTransfers,
    functionalLevelAmbulation,
    otNeeds,
    toleratesTherapiesStanding,
    providerRecommendedDisposition,
    primaryDiagnosis,
    comorbidConditions,
    patientLivesWith,
    homeLevels,
    homeSTE,
    homeSteps,
    rampEntry,
    occupation,
    driving,
    therapyTolerated,
    gaitAids,
    distance,
    age,
    selectedOption,
    bathing,
    toileting,
    ubd,
    lbd,
    feeding,
    other,
    currentCognition,
    selectedHospital,
  } = form;

  /* --------------------------------------------------------------------
   * EFFECTS
   * ------------------------------------------------------------------*/
  useEffect(() => {
    const loadInitialData = async () => {
      const hospitalsData = await fetchHospitals();
      setHospitals(hospitalsData);
    };

    loadInitialData();
  }, []);

  /* --------------------------------------------------------------------
   * DERIVED VALUES & HELPERS
   * ------------------------------------------------------------------*/
  const hospitalOptions = hospitals?.map((hosp) => ({
    label: hosp.hospital,
    value: hosp.abbreviation,
  }));

  const handleOptionClick = (value: string) => {
    setSelectedOption(value);
    if (errors.selectedOption) {
      setErrors((prev: FormErrors) => ({ ...prev, selectedOption: false }));
    }
  };

  const handleHospitalChange = (value: string | number | (string | number)[]) => {
    const abbreviation = value as string;
    const fullHospital = hospitals.find((h) => h.abbreviation === abbreviation);
    setSelectedHospital(fullHospital ?? null);
  };

  const handleFieldChange = (
    fieldName: keyof FormFields,
    value: string | number | (string | number)[],
    setter: (value: string | number | (string | number)[]) => void,
  ): void => {
    setter(value);
    const strValue = Array.isArray(value) ? String(value[0] ?? '') : String(value);
    if (strValue && errors[fieldName]) {
      setErrors((prev: FormErrors) => ({ ...prev, [fieldName]: false }));
    }
  };

  // Validate age and determine if confirmation is needed
  const validateAge = useCallback((ageVal?: number | null): 'ok' | 'under' | 'over' => {
    if (ageVal === undefined || ageVal === null || isNaN(ageVal)) return 'ok';
    if (ageVal < AGE_MIN_WARNING) return 'under';
    if (ageVal > AGE_MAX_WARNING) return 'over';
    return 'ok';
  }, []);

  /* --------------------------------------------------------------------
   * EXECUTION LOG HELPER
   * ------------------------------------------------------------------*/
  const handleSaveExecutionLog = async (
    confidence: string,
    disposition: string,
    payload: ExecutionLogPayload,
  ) => {
    try {
      const executionLogData = {
        ...payload,
        providerRecommendedDisposition: providerRecommendedDisposition.trim(),
        confidence,
        disposition,
      };
      const logResult = await saveExecutionLog(executionLogData);
      if (logResult.success) {
        toast.success('Execution Log Saved!', TOAST_CONFIG.SUCCESS);
      }
    } catch (error) {
      console.error('Error saving execution log:', error);
      toast.error('Failed to save execution log', TOAST_CONFIG.ERROR);
    }
  };

  /* --------------------------------------------------------------------
   * CORE SUBMITTER (shared by normal flow & warning-modal confirm)
   * ------------------------------------------------------------------*/
  const performSubmit = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const payload: DispoConsultFormData = {
        age,
        gender,
        hospital: selectedHospital,
        date_of_admission: dateOfAdmission ? format(dateOfAdmission, 'MM/dd/yyyy') : '',
        baseline_cognition: baselineCognition,
        current_cognition: currentCognition,
        ramp_entry: rampEntry,
        disposition_goals: dispositionGoals.trim(),
        diagnosis_category: diagnosis.trim(),
        insurance_payer: insurancePayerType.trim(),
        prior_level_of_function: priorLevelOfFunction.trim(),
        prior_living_arrangement: priorLivingArrangement.trim(),
        available_social_support: availableSupport.trim(),
        transfer_functional_level: functionalLevelTransfers.trim(),
        ambulation_functional_level: functionalLevelAmbulation.trim(),
        ot_needs: otNeeds,
        tolerates_therapies_standing: toleratesTherapiesStanding,
        primary_diagnosis: primaryDiagnosis.trim(),
        comorbid_conditions: comorbidConditions.trim(),
        patient_lives_with: patientLivesWith.trim(),
        home_levels: homeLevels ?? 0,
        home_ste: homeSTE ?? 0,
        home_steps: homeSteps ?? 0,
        occupation: occupation.trim(),
        driving,
        therapy_tolerated: therapyTolerated,
        gait_aids: gaitAids.trim(),
        distance: distance ?? 0,
        bathing: bathing.trim(),
        toileting: toileting.trim(),
        ubd: ubd.trim(),
        lbd: lbd.trim(),
        feeding: feeding.trim(),
        other: other.trim(),
        provider_recommended_disposition: providerRecommendedDisposition.trim(),
        selected_option: selectedOption.trim(),
      };

      const executionLogPayload: ExecutionLogPayload = {
        ambulation_functional_level: payload.ambulation_functional_level!,
        available_social_support: payload.available_social_support!,
        insurance_payer: payload.insurance_payer!,
        ot_needs: payload.ot_needs!,
        prior_level_of_function: payload.prior_level_of_function!,
        prior_living_arrangement: payload.prior_living_arrangement!,
        tolerates_therapies_standing: payload.tolerates_therapies_standing!,
        transfer_functional_level: payload.transfer_functional_level!,
        selected_option: payload.selected_option!,
        therapy_tolerated: payload.therapy_tolerated!,
        diagnosis_category: payload.diagnosis_category!,
        provider_recommended_disposition: payload.provider_recommended_disposition!,
      };

      setFormData(payload);

      const data = await saveDispoConsult(payload);
      toast.success('Form submitted successfully', TOAST_CONFIG.SUCCESS);

      const highestScoreOption = data.allOptions.reduce((prev: Option, current: Option) =>
        current.score > prev.score ? current : prev,
      );

      setScore(highestScoreOption.name);
      setResult(data);
      await handleSaveExecutionLog(data.confidence, data.disposition, executionLogPayload);

      setIsNext(true);

      if (onSubmitSuccess) {
        onSubmitSuccess(data as ExtendedResult);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred while submitting the form', TOAST_CONFIG.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  /* --------------------------------------------------------------------
   * SUBMIT HANDLER
   * ------------------------------------------------------------------*/
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Form validation
    const newErrors: FormErrors = {
      selectedOption: !selectedOption,
      diagnosis: !diagnosis,
      insurancePayerType: !insurancePayerType,
      priorLevelOfFunction: !priorLevelOfFunction,
      priorLivingArrangement: !priorLivingArrangement,
      availableSupport: !availableSupport,
      functionalLevelTransfers: !functionalLevelTransfers,
      functionalLevelAmbulation: !functionalLevelAmbulation,
      providerRecommendedDisposition: !providerRecommendedDisposition,
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      toast.error('Please fill all the required fields', TOAST_CONFIG.ERROR);
      return;
    }

    // Age sanity checks
    if (age !== undefined && age !== null) {
      if (age <= 0) {
        toast.error('Age cannot be zero or negative', TOAST_CONFIG.ERROR);
        return;
      }

      // Show confirmation for out-of-range ages
      const ageResult = validateAge(age);
      if (ageResult !== 'ok') {
        setAgeWarningType(ageResult);
        return;
      }
    }

    // Admit date older than 90 days — ask for confirmation next
    if (dateOfAdmission && isDateValid(dateOfAdmission) && isOlderThanNDays(dateOfAdmission, 90)) {
      setShowAdmitWarning(true);
      return;
    }

    // Block future admission dates
    if (dateOfAdmission && isDateValid(dateOfAdmission)) {
      const admitDateObj = parseDate(dateOfAdmission);
      if (admitDateObj && admitDateObj > new Date()) {
        setShowFutureDateError(true);
        return;
      }
    }

    // Proceed with normal submission
    await performSubmit();
  };

  /* --------------------------------------------------------------------
   * RENDER
   * ------------------------------------------------------------------*/

  return (
    <>
      {isNext ? (
        <SpecializedCareNeeds
          setSummary={setSummary}
          formData={{
            ...formData,
            disposition: result?.disposition,
            confidence: result?.confidence,
          }}
          setIsOpen={setIsOpen}
          setIsNext={setIsNext}
          selectedItems={selectedItems}
          setSelectedItems={setSelectedItems}
        />
      ) : (
        <form onSubmit={handleSubmit} className="p-1 md:p-5 flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col items-start mb-[30px]">
            <h2 className="text-sm md:text-base  2xl:text-2xl font-gotham-bold text-secondary mb-2">
              Decision Support Assistant for Discharge Planning
            </h2>
            <p className="text-sm  2xl:text-base max-w-7xl font-gotham-normal opacity-[0.7] text-secondary">
              This tool assists clinical decision-making by supporting early discharge planning,
              pre-authorization justification, and rehabilitation coordination—while also providing
              predictive insights.
            </p>
          </div>

          {/* Medical Readiness */}
          <div className="pb-6 flex flex-col gap-[5px]">
            <h2 className="text-base font-gotham-bold text-secondary px-[5px]">
              Medical Readiness to Discharge <span className="required">*</span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
              {options.medicalReadiness.map((option) => (
                <div
                  key={option.value}
                  className={`rounded-2xl border  text-sm  2xl:text-base font-gotham-medium text-secondary px-7 py-6 text-center flex justify-between border-subtle items-center leading-[1.375] cursor-pointer bg-white hover:bg-table-group
                   outline-none    transition-colors ${
                     selectedOption === option.value
                       ? 'bg-primary-gradient text-white border-transparent'
                       : ''
                   }`}
                  onClick={() => handleOptionClick(option.value)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOptionClick(option.value);
                    }
                  }}
                >
                  <div>
                    <span>{option.label}</span>
                  </div>
                  <HoverContent
                    hoverContent={
                      <span className="max-w-[200px] text-[var(--text-primary)] block text-center text-sm">
                        {option.description}
                      </span>
                    }
                    position="top"
                    className="icon-interactive"
                  >
                    <InfoIcon className="icon-size-sm fill-current" />
                  </HoverContent>
                </div>
              ))}
            </div>
            {errors.selectedOption && (
              <span className="required mt-2 text-sm">
                Please select a medical readiness option
              </span>
            )}
          </div>

          {/* ---------------- FORM GRID ---------------- */}
          <div className="grid grid-cols-1  gap-6">
            {/* 1. Clinical Info Section */}
            <div className="h-full border border-subtle rounded-[10px] card-shadow-lg">
              <h3 className="bg-table-group font-gotham-bold text-secondary px-5 py-4 mb-3 2xl:mb-5 text-base 2xl:text-lg">
                Clinical Info
              </h3>
              <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 2xl:gap-10">
                {/* Age */}
                <InputField
                  label="Age"
                  type="number"
                  labelClassName="text-xs  2xl:text-sm font-gotham-bold text-secondary"
                  value={age?.toString() || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setAge(value === '' ? undefined : Number(value));
                  }}
                  placeholder="Enter Patient's Age"
                  className="text-sm 2xl:text-base"
                />

                {/* Gender */}
                <LabeledDropdown
                  label="Gender"
                  value={gender}
                  onChange={(value) => setGender(value)}
                  options={options.gender}
                />

                {/* Current Location */}
                <LabeledDropdown
                  label="Current Location"
                  value={selectedHospital?.abbreviation || ''}
                  onChange={handleHospitalChange}
                  options={hospitalOptions}
                />

                {/* Date of Admission */}
                <InputField
                  label="Date of Admission"
                  type="date"
                  id="dateofAdmission"
                  placeholder="mm/dd/yyyy"
                  labelClassName="text-xs  2xl:text-sm font-gotham-bold text-secondary"
                  required
                  value={
                    dateOfAdmission && isDateValid(dateOfAdmission)
                      ? formatISODate(dateOfAdmission)
                      : ''
                  }
                  onChange={(e) => setDateOfAdmission(e.target.value)}
                />

                {/* Insurance Payer */}
                <LabeledDropdown
                  label="Insurance Payer"
                  value={insurancePayerType}
                  onChange={(value) =>
                    handleFieldChange('insurancePayerType', value, setInsurancePayerType)
                  }
                  options={options.insurancePayerType}
                  required
                  error={errors.insurancePayerType}
                />

                {/* Diagnosis Category */}
                <LabeledDropdown
                  label="Diagnosis Category"
                  value={diagnosis}
                  onChange={(value) => handleFieldChange('diagnosis', value, setDiagnosis)}
                  options={options.diagnosis}
                  required
                  error={errors.diagnosis}
                />

                {/* Primary Diagnosis - spans all columns */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                  <InputField
                    label="Primary Diagnosis"
                    type="text"
                    value={primaryDiagnosis}
                    labelClassName="text-xs  2xl:text-sm font-gotham-bold text-secondary"
                    className="2xl:text-base"
                    onChange={(e) => setPrimaryDiagnosis(e.target.value)}
                    placeholder="Enter primary diagnosis"
                  />
                </div>

                {/* Comorbid Conditions - spans all columns */}
                <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                  <Textarea
                    label="Comorbid Conditions"
                    value={comorbidConditions}
                    className="2xl:text-base"
                    onChange={(e) => setComorbidConditions(e.target.value)}
                    placeholder="Enter Comorbid Conditions"
                    variant="large"
                  />
                </div>
              </div>
            </div>

            {/* 2. Functional Levels Section */}
            <div className="h-full border border-subtle rounded-[10px] card-shadow-lg">
              <h3 className="bg-table-group font-gotham-bold text-secondary px-5 py-4 mb-3 2xl:mb-5 text-base 2xl:text-lg">
                Functional Levels
              </h3>
              <div className="p-5 flex flex-col gap-6 2xl:gap-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <LabeledDropdown
                    label="Prior Level of Function"
                    value={priorLevelOfFunction}
                    onChange={(value) =>
                      handleFieldChange('priorLevelOfFunction', value, setPriorLevelOfFunction)
                    }
                    options={options.priorLevelOfFunction}
                    required
                    error={errors.priorLevelOfFunction}
                  />
                  <LabeledDropdown
                    label="Baseline Cognition"
                    value={baselineCognition}
                    onChange={(value) => setBaselineCognition(value)}
                    options={options.baselineCognition}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <InputField
                    label="Gait Aids"
                    type="text"
                    value={gaitAids}
                    labelClassName="text-xs  2xl:text-sm font-gotham-bold text-secondary"
                    onChange={(e) => setGaitAids(e.target.value)}
                    placeholder="Enter Gait Aids"
                  />
                  <InputField
                    label="Occupation"
                    type="text"
                    labelClassName="text-xs  2xl:text-sm font-gotham-bold text-secondary"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="Enter Occupation"
                  />
                </div>

                {/* Functional Categories Grid */}
                <div className="w-full lg:w-[30%]">
                  <YesNoToggle
                    value={driving}
                    labelClassName="text-xs  2xl:text-sm font-gotham-bold text-secondary"
                    onChange={setDriving}
                    label="Driving"
                  />
                </div>
                <h4 className="text-base 2xl:text-lg font-gotham-bold text-secondary">
                  Current Level of Function
                </h4>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 2xl:gap-10">
                  <LabeledDropdown
                    label="Transfers"
                    value={functionalLevelTransfers}
                    onChange={(value) =>
                      handleFieldChange(
                        'functionalLevelTransfers',
                        value,
                        setFunctionalLevelTransfers,
                      )
                    }
                    options={options.functionalLevelTransfers}
                    required
                    error={errors.functionalLevelTransfers}
                  />

                  <LabeledDropdown
                    label="Mobility / Ambulation"
                    value={functionalLevelAmbulation}
                    onChange={(value) =>
                      handleFieldChange(
                        'functionalLevelAmbulation',
                        value,
                        setFunctionalLevelAmbulation,
                      )
                    }
                    options={options.functionalLevelAmbulation}
                    required
                    error={errors.functionalLevelAmbulation}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="flex flex-col w-full items-start gap-4">
                    <label className="block text-xs 2xl:text-sm font-gotham-bold text-secondary ">
                      Distance
                    </label>
                    <div className="relative w-full inline-block">
                      <input
                        type="number"
                        name="distance"
                        value={distance ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setDistance(value === '' ? undefined : Number(value));
                        }}
                        className="w-full  h-[32px] lg:h-[32px] lg:h-[40px] 2xl:h-[44px] px-5 border border-input rounded-[32px] font-gotham-medium text-sm 2xl:text-base text-secondary placeholder:text-secondary placeholder:opacity-50 transition-all bg-[var(--input-bg)] focus:outline-none focus:ring-2 focus-ring-primary focus-border-primary"
                        style={{ paddingRight: '40px' }}
                        placeholder="Enter distance"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-secondary">
                        ft
                      </span>
                    </div>
                  </div>
                  <div>
                    <YesNoToggle
                      value={otNeeds}
                      labelClassName="text-xs  2xl:text-sm font-gotham-bold text-secondary"
                      onChange={setOtNeeds}
                      label="OT Needs"
                      required
                    />
                  </div>
                </div>

                {/* ADL Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <LabeledDropdown
                    label="Bathing"
                    value={bathing}
                    onChange={setBathing}
                    options={options.assistanceOptions}
                  />
                  <LabeledDropdown
                    label="Toileting"
                    value={toileting}
                    onChange={setToileting}
                    options={options.assistanceOptions}
                  />
                  <LabeledDropdown
                    label="Upper Body Dressing"
                    value={ubd}
                    onChange={setUbd}
                    options={options.assistanceOptions}
                  />
                  <LabeledDropdown
                    label="Lower Body Dressing"
                    value={lbd}
                    onChange={setLbd}
                    options={options.assistanceOptions}
                  />
                  <LabeledDropdown
                    label="Feeding"
                    value={feeding}
                    onChange={setFeeding}
                    options={options.assistanceOptions}
                  />
                  <LabeledDropdown
                    label="Other"
                    value={other}
                    onChange={setOther}
                    options={options.assistanceOptions}
                  />
                </div>
                <LabeledDropdown
                  label="Current Cognition"
                  value={currentCognition}
                  onChange={setCurrentCognition}
                  options={options.currentCognition}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div>
                    <YesNoToggle
                      value={toleratesTherapiesStanding}
                      onChange={setToleratesTherapiesStanding}
                      label="Standing Tolerated"
                      required
                      labelClassName="text-xs  2xl:text-sm font-gotham-bold text-secondary"
                    />
                  </div>

                  <div>
                    <YesNoToggle
                      value={therapyTolerated}
                      onChange={setTherapyTolerated}
                      label="Therapy Tolerated"
                      required
                      labelClassName="text-xs  2xl:text-sm font-gotham-bold text-secondary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Social Support Section */}
            <div className="h-full border border-subtle rounded-[10px] card-shadow-lg">
              <h3 className="bg-table-group font-gotham-bold text-secondary mb-3 2xl:mb-5 px-5 py-4 text-base 2xl:text-lg">
                Social Support
              </h3>
              <div className="p-5 grid grid-cols-1 gap-6 2xl:gap-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <LabeledDropdown
                    label="Support at Home"
                    value={availableSupport}
                    onChange={(value) =>
                      handleFieldChange('availableSupport', value, setAvailableSupport)
                    }
                    options={options.availableSupport}
                    required
                    error={errors.availableSupport}
                  />
                  <LabeledDropdown
                    label="Prior Living Arrangement"
                    value={priorLivingArrangement}
                    onChange={(value) =>
                      handleFieldChange(
                        'priorLivingArrangement',
                        value as string,
                        setPriorLivingArrangement,
                      )
                    }
                    options={options.priorLivingArrangement}
                    required
                    error={errors.priorLivingArrangement}
                  />
                </div>

                <div>
                  <InputField
                    label="Patient Lives With"
                    type="text"
                    labelClassName="text-xs  2xl:text-sm font-gotham-bold text-secondary"
                    value={patientLivesWith}
                    onChange={(e) => setPatientLivesWith(e.target.value)}
                    placeholder="Enter living arrangement details"
                  />
                </div>

                <div>
                  <h4 className="text-base 2xl:text-lg font-gotham-bold text-secondary mb-4 2xl:mb-6">
                    Home Details
                  </h4>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 2xl:gap-6">
                    <div className="flex flex-col">
                      <label className="block text-xs 2xl:text-sm font-gotham-bold text-secondary mb-2">
                        Levels
                      </label>
                      <input
                        type="number"
                        value={homeLevels ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setHomeLevels(value === '' ? undefined : Number(value));
                        }}
                        className="w-full  h-[32px] lg:h-[40px] 2xl:h-[44px] px-5 border border-input rounded-[32px] font-gotham-medium text-sm 2xl:text-base text-secondary placeholder:text-secondary placeholder:opacity-50 transition-all bg-[var(--input-bg)] focus:outline-none focus:ring-2 focus-ring-primary focus-border-primary"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="block text-xs 2xl:text-sm font-gotham-bold text-secondary mb-2">
                        STE
                      </label>
                      <input
                        type="number"
                        value={homeSTE ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setHomeSTE(value === '' ? undefined : Number(value));
                        }}
                        className="w-full  h-[32px] lg:h-[40px] 2xl:h-[44px] px-5 border border-input rounded-[32px] font-gotham-medium text-sm 2xl:text-base text-secondary placeholder:text-secondary placeholder:opacity-50 transition-all
                        bg-[var(--input-bg)] focus:outline-none focus:ring-2 focus-ring-primary focus-border-primary"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="block text-xs 2xl:text-sm font-gotham-bold text-secondary mb-2">
                        Steps within Home
                      </label>
                      <input
                        type="number"
                        value={homeSteps ?? ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setHomeSteps(value === '' ? undefined : Number(value));
                        }}
                        className="w-full  h-[32px] lg:h-[40px] 2xl:h-[44px] px-5 border border-input rounded-[32px] font-gotham-medium text-sm 2xl:text-base text-secondary placeholder:text-secondary placeholder:opacity-50 transition-all bg-[var(--input-bg)] focus:outline-none focus:ring-2 focus-ring-primary focus-border-primary"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <YesNoToggle
                      labelClassName="text-xs  2xl:text-sm font-gotham-bold text-secondary"
                      value={rampEntry}
                      onChange={setRampEntry}
                      label="Ramp Entry"
                    />
                  </div>
                  <InputField
                    label="Disposition Goals"
                    type="text"
                    labelClassName="text-xs  2xl:text-sm font-gotham-bold text-secondary"
                    value={dispositionGoals}
                    onChange={(e) => setDispositionGoals(e.target.value)}
                    placeholder="Enter Disposition Goals"
                  />
                </div>
              </div>
            </div>

            {/* Provider Recommendation */}
            <div className="w-full p-5">
              <LabeledDropdown
                label="Provider's Recommended Disposition"
                value={providerRecommendedDisposition}
                onChange={(value) =>
                  handleFieldChange(
                    'providerRecommendedDisposition',
                    value,
                    setProviderRecommendedDisposition,
                  )
                }
                options={options.providerRecommendedDisposition}
                required
                error={errors.providerRecommendedDisposition}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 mt-6">
              <Button
                type="submit"
                size="large"
                className="px-6 py-3 2xl:px-10 font-gotham-medium transition-all duration-200 flex items-center gap-2"
                childrenClassName="text-sm 2xl:text-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader size="sm" className="mr-2" />
                    loading...
                  </div>
                ) : (
                  'Next'
                )}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* ---------------- MODAL ---------------- */}
      <CustomModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        title="Rehab Details Summary"
      >
        <RehabDetailsContent
          summary={summary}
          score={score}
          formData={formData}
          selectedItems={selectedItems}
        />
      </CustomModal>

      {/* Admit date confirmation modal */}
      <ConfirmationModal
        open={showAdmitWarning}
        onClose={() => setShowAdmitWarning(false)}
        onConfirm={() => {
          setShowAdmitWarning(false);
          performSubmit();
        }}
        title="Warning"
        message="Warning: The admission date entered is over 90 days old. If this is correct, click Confirm. Otherwise, please review and update the date."
        confirmText="Confirm"
        cancelText="Back"
        icon={<WarningIcon />}
      />

      {/* Future date error modal */}
      <ConfirmationModal
        open={showFutureDateError}
        onClose={() => setShowFutureDateError(false)}
        onConfirm={() => setShowFutureDateError(false)}
        title="Admit Date Error"
        message="Admit date cannot be in the future. Please review and update the date."
        confirmText="OK"
        cancelText="Close"
        icon={<WarningIcon />}
      />

      {/* Age confirmation modal */}
      <ConfirmationModal
        open={ageWarningType !== null}
        onClose={() => setAgeWarningType(null)}
        onConfirm={() => {
          setAgeWarningType(null);
          performSubmit();
        }}
        title="Age Warning"
        message={
          ageWarningType === 'under'
            ? `Patient age appears to be under ${AGE_MIN_WARNING} years. If this is correct, click Continue. Otherwise, please review and update the age.`
            : `Patient age appears to be greater than ${AGE_MAX_WARNING} years. If this is correct, click Continue. Otherwise, please review and update the age.`
        }
        confirmText="Continue"
        cancelText="Back"
      />
    </>
  );
};

export default DispoConsultForm;

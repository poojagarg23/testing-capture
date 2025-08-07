import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { toast } from 'react-toastify';
import DiagnosisComponent from '../reusable/Diagnosis.tsx';
import PageHeader from '../reusable/custom/PageHeader.tsx';
import InputField from '../reusable/custom/InputField.tsx';
import Dropdown from '../reusable/custom/Dropdown.tsx';
import Button from '../reusable/custom/Button.tsx';
import Checkbox from '../reusable/custom/Checkbox.tsx';
import ConfirmationModal from '../reusable/ConfirmationModal.tsx';
import {
  saveDiagnosis,
  addPatient,
  addPatientIdToChargesPage,
  updateCommonPatientDetails,
  formatProviderName,
  authorizedTitles,
  fetchUserDetails,
  fetchHospitals,
  fetchAuthorizedProviders,
} from '../../helpers/index';
import Loader from '../reusable/Loader.tsx';
import type { PatientDetailsProps } from '../../types/PatientDetails.types';
import type { Provider, Hospital, Diagnosis } from '../../types';
import type { Patient } from '../../types/Patient.types';
import PlusIcon from '../../assets/icons/plus-icon.svg?react';
import {
  formatDisplayDate,
  formatISODate,
  isDateValid,
  isOlderThanNDays,
} from '../../helpers/dateUtils.ts';
import { TOAST_CONFIG } from '../../constants/index.ts';

export type PatientDetailsHandle = {
  hasUnsavedChanges: () => boolean;
  resetUnsavedChanges: () => void;
  discardChanges: () => void;
};

const PatientDetails = forwardRef<PatientDetailsHandle, PatientDetailsProps>(
  (
    {
      patient,
      subMode,
      mode,
      selectedDiagnosisProps = [],
      autoFillChoice = false,
      onClose,
      onRefetch,
    },
    ref,
  ) => {
    const [showDiagnosis, setShowDiagnosis] = useState(false);

    const id: number | undefined = patient?.id;
    if (patient && patient.status === null) {
      patient.status = 'active';
    }
    const [firstname, setFirstName] = useState<string | null>(
      patient && patient.firstname ? patient.firstname : null,
    );
    const [lastname, setLastName] = useState<string | null>(
      patient && patient.lastname ? patient.lastname : null,
    );
    const [middlename, setMiddleName] = useState<string | null>(
      patient && patient.middlename ? patient.middlename : null,
    );
    const [gender, setGender] = useState<string | null>(
      patient && patient.gender ? patient.gender.toLowerCase() : null,
    );
    // Admit Date State (store reference string like DOB)
    const [admitdate, setAdmitDate] = useState<Date | string | null>(
      patient && patient.admitdate ? formatISODate(patient.admitdate) : null,
    );
    // Fix: Convert string dates to Date objects correctly when initializing state
    const [dateofbirth, setDob] = useState<Date | string | null>(
      patient && patient.dateofbirth ? formatISODate(patient.dateofbirth) : null,
    );

    const [hospital_id, setHospitalId] = useState<number | null>(
      patient && patient.hospital ? patient?.hospital?.id : null,
    );

    const [visittype, setVisitType] = useState<'inpatient' | 'consult' | null>(
      patient && patient.visittype ? (patient.visittype as 'inpatient' | 'consult') : null,
    );
    const [facesheetalias] = useState<string | null>(
      patient && patient.facesheetalias ? patient.facesheetalias : null,
    ); // Fix: Removed unused setter
    const [status, setStatus] = useState<'active' | 'inactive'>(
      patient && patient.status ? (patient.status as 'active' | 'inactive') : 'active',
    );
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedDiagnosis, setSelectedDiagnosis] = useState<Diagnosis[]>(selectedDiagnosisProps);
    const [addPatientToChargesPage, setAddPatientToChargesPage] = useState<boolean>(true);
    const [age, setAge] = useState<number | null>(null);
    const [saveLoading, setSaveLoading] = useState<boolean>(false);
    // State to control Admit-date age warning modal
    const [showAdmitWarning, setShowAdmitWarning] = useState<boolean>(false);
    const [showFutureAdmitError, setShowFutureAdmitError] = useState<boolean>(false);
    // Duplicate patient confirmation modal
    const [showCreateAdmissionModal, setShowCreateAdmissionModal] = useState<boolean>(false);
    const [duplicateMessage, setDuplicateMessage] = useState<string>('');
    // const [diagnosisToggleModal, setDiagnosisToggleModal] = useState<(() => void) | null>(null);
    const [authorizedProviders, setAuthorizedProviders] = useState<Provider[]>([]);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [provider, setProvider] = useState<Provider>(
      patient && patient.provider
        ? patient.provider
        : authorizedProviders.length > 0
          ? authorizedProviders[0]
          : ({} as Provider),
    );
    const oldPatientDataRef = useRef<Patient>(JSON.parse(JSON.stringify(patient)));

    // Track if there are any unsaved modifications made in the form
    const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);

    // Calculate age from date of birth
    const calculateAge = useCallback((birthDate: Date | string | null): number | null => {
      if (!birthDate) return null;
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    }, []);

    // Update age when date of birth changes (no immediate toast warnings)
    useEffect(() => {
      const calculatedAge = calculateAge(dateofbirth);
      setAge(calculatedAge);
    }, [dateofbirth, calculateAge]);

    /* ---------------------------------------------------------------
     * DOB validation helpers & modal state
     * ------------------------------------------------------------- */

    const validateDOB = useCallback((): 'ok' | 'under' | 'over' | 'future' => {
      if (!dateofbirth || !isDateValid(dateofbirth)) return 'ok';

      const dobDate = new Date(dateofbirth as string);
      const today = new Date();

      today.setHours(0, 0, 0, 0);
      dobDate.setHours(0, 0, 0, 0);

      if (dobDate >= today) return 'future';

      const ageVal = calculateAge(dateofbirth);
      if (ageVal !== null) {
        if (ageVal < 18) return 'under';
        if (ageVal > 130) return 'over';
      }
      return 'ok';
    }, [dateofbirth, calculateAge]);

    const [dobWarningType, setDobWarningType] = useState<'under' | 'over' | 'future' | null>(null);
    const pendingSaveRef = useRef<() => void>(() => {});

    const handlePatientOnChange = useCallback(
      (patient_key: string, value: string) => {
        // Mark the form dirty whenever a change is made
        setUnsavedChanges(true);

        if (patient_key === 'firstname') {
          setFirstName(value.toString());
          patient.firstname = value.toString();
        }

        if (patient_key === 'lastname') {
          setLastName(value.toString());
          patient.lastname = value.toString();
        }

        if (patient_key === 'middlename') {
          setMiddleName(value.toString());
          patient.middlename = value.toString();
        }

        if (patient_key === 'dateofbirth') {
          setDob(value); // Store the YYYY-MM-DD string directly
          patient.dateofbirth = value; // Keep as string in YYYY-MM-DD format
        }

        if (patient_key === 'gender') {
          setGender(value.toString());
          patient.gender = value.toString();
        }

        if (patient_key === 'hospital_id') {
          const numValue = Number(value);
          setHospitalId(numValue);
          const selectedHospital = hospitals.find((h) => h.id === numValue);
          if (selectedHospital) {
            patient.hospital = {
              id: selectedHospital.id,
              abbreviation: selectedHospital.abbreviation,
              hospital: selectedHospital.hospital,
              amd_hospital_id: selectedHospital.amd_hospital_id,
            };
          }
        }
        if (patient_key === 'visittype') {
          const visitValue = value.toString() as 'inpatient' | 'consult';
          setVisitType(visitValue);
          patient.visittype = visitValue;
        }

        if (patient_key === 'status') {
          const statusValue = value.toString() as 'active' | 'inactive';
          setStatus(statusValue);
          patient.status = statusValue;
        }

        if (patient_key === 'provider') {
          const selectedProvider = authorizedProviders.find((p) => p.id === Number(value));
          if (selectedProvider) {
            setProvider(selectedProvider);
            patient.provider = selectedProvider;
          }
        }

        if (patient_key === 'admitdate') {
          setAdmitDate(value); // Store the YYYY-MM-DD string directly
          patient.admitdate = value; // Keep as string in YYYY-MM-DD format
        }
      },
      [hospitals, patient, authorizedProviders],
    );

    const handleFetchAuthorizedProviders = useCallback(async () => {
      try {
        const [userData, providers, hospitals] = await Promise.all([
          fetchUserDetails(),
          fetchAuthorizedProviders(),
          fetchHospitals(),
        ]);

        if (providers && hospitals && userData) {
          setAuthorizedProviders(providers);
          setHospitals(hospitals);
          if (mode === 'add') {
            if (authorizedTitles.includes(userData.title)) {
              const matchingProvider = providers.find(
                (prov) => prov.id === userData.id && authorizedTitles.includes(prov.title),
              );
              if (matchingProvider) {
                setProvider(matchingProvider);
                patient.provider = matchingProvider;
              }
            }
          }
        }
      } catch (error) {
        console.warn(error);
      }
    }, [mode, patient]);

    useEffect(() => {
      handleFetchAuthorizedProviders();
      oldPatientDataRef.current = JSON.parse(JSON.stringify(patient));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSelectedDiagnosis = (diagArray: Diagnosis[]) => {
      patient.selectedDiagnosis = diagArray;
      setSelectedDiagnosis(diagArray);
    };

    const submitForm = async () => {
      // Optimistically mark form as clean to avoid prompt when navigating immediately after clicking save.
      setUnsavedChanges(false);

      if (firstname === null || firstname === '') {
        toast.error('Please enter first name', TOAST_CONFIG.ERROR);
        return;
      }

      if (lastname === null || lastname === '') {
        toast.error('Please enter last name', TOAST_CONFIG.ERROR);
        return;
      }

      // Fix: Change type comparison to check for null only
      if (dateofbirth === null) {
        toast.error('Please select DOB', TOAST_CONFIG.ERROR);
        return;
      }

      if (visittype === null) {
        toast.error('Please select visit type', TOAST_CONFIG.ERROR);
        return;
      }

      if (admitdate === null) {
        toast.error('Please select admit date', TOAST_CONFIG.ERROR);
        return;
      }
      // Fix: Change type comparison for number
      let selectedHospitalId: number | null = null;
      if (patient.hospital && patient.hospital.id) {
        selectedHospitalId = patient.hospital.id;
      } else if (hospital_id !== null) {
        selectedHospitalId = hospital_id;
      }
      if (selectedHospitalId === null) {
        toast.error('Please select place of service', TOAST_CONFIG.ERROR);
        return;
      }

      // Fix: Change type comparison for number
      if (provider === null) {
        toast.error('Please select provider', TOAST_CONFIG.ERROR);
        return;
      }

      try {
        setLoading(true);

        const selectedHospital = hospitals.find((h) => h.id === selectedHospitalId);
        if (!selectedHospital) {
          toast.error('Selected hospital not found', TOAST_CONFIG.ERROR);
          setLoading(false);
          return;
        }
        const response = await addPatient(
          id,
          firstname,
          lastname,
          middlename,
          gender,
          patient.dateofbirth,
          null, // room
          selectedHospital,
          patient.admitdate ?? admitdate,
          null, // dischargedate
          visittype,
          status,
          facesheetalias,
          provider,
        );
        const rawData = response;
        const jsonResponse = await rawData.json();
        if (jsonResponse.prompt === true) {
          setDuplicateMessage(
            jsonResponse.message ?? 'Patient already exists. Create new admission?',
          );
          setShowCreateAdmissionModal(true);
          setLoading(false);
          return;
        }

        if (jsonResponse.success === true) {
          toast.success('Patient updated successfully', TOAST_CONFIG.SUCCESS);
          const result = await saveDiagnosis(jsonResponse.id, selectedDiagnosis);
          if (result) {
            if (selectedDiagnosis.length > 0) {
              toast.success('Diagnosis Saved!', TOAST_CONFIG.SUCCESS);
            }
          } else {
            toast.error('Failed to save diagnosis', TOAST_CONFIG.ERROR);
          }
          if (addPatientToChargesPage) {
            const result = await addPatientIdToChargesPage(jsonResponse.id);
            const response = await result.json();
            if (result.ok) {
              toast.success('Patient added to charges page', TOAST_CONFIG.SUCCESS);
            } else {
              toast.error(response.message, TOAST_CONFIG.ERROR);
            }
          }

          // Close modal and refetch data after successful save
          onClose?.();
          onRefetch?.();
          setLoading(false);
        } else {
          setLoading(false);
          toast.error('Failed to update patient', TOAST_CONFIG.ERROR);
        }
      } catch (err) {
        console.error('Error updating patient:', err);
        setLoading(false);
        toast.error('An error occurred while updating patient', TOAST_CONFIG.ERROR);
      }
    };

    // Wrapper that checks admit date age and DOB validity before saving (only for **add** mode)
    const handleSaveWithAdmitCheck = () => {
      // Validate DOB
      const dobResult = validateDOB();
      if (dobResult !== 'ok') {
        setDobWarningType(dobResult);
        pendingSaveRef.current = submitForm;
        return;
      }

      if (patient.admitdate ?? admitdate) {
        const admit = new Date((patient.admitdate ?? admitdate) as string);
        const today = new Date();
        admit.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        if (admit > today) {
          setShowFutureAdmitError(true);
          return;
        }
      }
      // Then check if admission date is older than 90 days
      if (isOlderThanNDays(patient.admitdate ?? admitdate, 90)) {
        setShowAdmitWarning(true);
        return;
      }

      submitForm();
    };

    const handleCreateAdmissionConfirm = async () => {
      setShowCreateAdmissionModal(false);
      try {
        setLoading(true);
        const selectedHospital = hospitals.find(
          (h) => h.id === (patient.hospital?.id ?? hospital_id),
        );
        if (!selectedHospital) {
          toast.error('Selected hospital not found', TOAST_CONFIG.ERROR);
          setLoading(false);
          return;
        }
        const response = await addPatient(
          id,
          firstname as string,
          lastname as string,
          middlename,
          gender,
          patient.dateofbirth,
          null,
          selectedHospital,
          patient.admitdate ?? admitdate,
          null,
          visittype as string,
          status,
          facesheetalias,
          provider,
          true, // createAdmission flag
        );
        const jsonResponse = await response.json();
        if (jsonResponse.success === true) {
          toast.success('New admission created successfully', TOAST_CONFIG.SUCCESS);
          const result = await saveDiagnosis(jsonResponse.id, selectedDiagnosis);
          if (result && selectedDiagnosis.length > 0) {
            toast.success('Diagnosis Saved!', TOAST_CONFIG.SUCCESS);
          }
          if (addPatientToChargesPage) {
            const result = await addPatientIdToChargesPage(jsonResponse.id);
            if (result.ok) {
              toast.success('Patient added to charges page', TOAST_CONFIG.SUCCESS);
            } else {
              const resp = await result.json();
              toast.error(resp.message, TOAST_CONFIG.ERROR);
            }
          }
          onClose?.();
          onRefetch?.();
        } else {
          toast.error(jsonResponse.message || 'Failed to create admission', TOAST_CONFIG.ERROR);
        }
      } catch (err) {
        console.error('Error creating new admission:', err);
        toast.error('An error occurred while creating admission', TOAST_CONFIG.ERROR);
      } finally {
        setLoading(false);
      }
    };

    const handleCommonPatientDetails = async (skipDobCheck = false) => {
      if (!skipDobCheck) {
        const dobResult = validateDOB();
        if (dobResult !== 'ok') {
          setDobWarningType(dobResult);
          pendingSaveRef.current = () => handleCommonPatientDetails(true);
          return;
        }
      }

      if (patient.admitdate ?? admitdate) {
        const admit = new Date((patient.admitdate ?? admitdate) as string);
        const today = new Date();
        admit.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        if (admit > today) {
          setShowFutureAdmitError(true);
          setSaveLoading(false);
          return;
        }
      }

      // Optimistically mark form as clean to avoid prompt if user navigates quickly
      setUnsavedChanges(false);
      setSaveLoading(true);

      const result = await updateCommonPatientDetails(patient, oldPatientDataRef.current);

      // Handle concurrency conflict
      if (typeof result === 'string' && result === '-2147217398') {
        await updateCommonPatientDetails(patient, oldPatientDataRef.current, true);
        // Assume force update succeeded
        setUnsavedChanges(false);
        oldPatientDataRef.current = JSON.parse(JSON.stringify(patient));
        setSaveLoading(false);
        return;
      }

      // On successful update (result is Patient object)
      if (typeof result !== 'string') {
        setUnsavedChanges(false);
        oldPatientDataRef.current = JSON.parse(JSON.stringify(patient));
        setSaveLoading(false);
      }
    };

    const isEditable = mode === 'add' || subMode === 'edit';

    const handleVisitTypeClick = (newType: 'inpatient' | 'consult') => {
      if (isEditable) {
        handlePatientOnChange('visittype', newType);
      }
    };

    const handleStatusClick = (newStatus: 'active' | 'inactive') => {
      if (isEditable) {
        handlePatientOnChange('status', newStatus);
      }
    };

    // Prepare dropdown options
    const genderOptions = [
      { label: 'Select Gender', value: '' },
      { label: 'Male', value: 'm' },
      { label: 'Female', value: 'f' },
      { label: 'Other', value: 'o' },
    ];

    const hospitalOptions = [
      { label: 'Select Place of Service', value: '' },
      ...hospitals.map((hospital) => ({
        label: hospital.hospital,
        value: hospital.id.toString(),
      })),
    ];

    const providerOptions = [
      { label: 'Select Provider', value: '' },
      ...authorizedProviders.map((prov) => ({
        label: formatProviderName(prov),
        value: prov.id.toString(),
      })),
    ];

    // Define which fields to show based on mode
    const isViewEditMode = mode === 'view&edit';
    const isEditMode = subMode === 'edit';
    const isReadOnly = isViewEditMode && !isEditMode;

    // Helper to copy data from original to local state & patient object
    const applyOriginalPatientData = (original: Patient) => {
      setFirstName(original.firstname ?? null);
      setLastName(original.lastname ?? null);
      setMiddleName(original.middlename ?? null);
      setGender(original.gender ? original.gender.toLowerCase() : null);

      // Dates
      setDob(original.dateofbirth ? formatISODate(original.dateofbirth) : null);
      setAdmitDate(original.admitdate ? formatISODate(original.admitdate) : null);

      // Other primitives
      setHospitalId(original.hospital?.id ?? null);
      setVisitType(original.visittype as 'inpatient' | 'consult' | null);
      setStatus(original.status as 'active' | 'inactive');

      // Provider & diagnosis
      setProvider(original.provider ?? ({} as Provider));
      setSelectedDiagnosis(original.selectedDiagnosis ?? []);

      // Also update mutable patient reference to match original
      Object.assign(patient, JSON.parse(JSON.stringify(original)));
    };

    // Expose imperative handle so parent components can check for unsaved changes
    useImperativeHandle(
      ref,
      () => ({
        hasUnsavedChanges: () => unsavedChanges,
        resetUnsavedChanges: () => setUnsavedChanges(false),
        discardChanges: () => {
          applyOriginalPatientData(oldPatientDataRef.current);
          setUnsavedChanges(false);
        },
      }),
      [unsavedChanges],
    );

    return (
      <div className="w-full">
        <div className="px-4 sm:px-6 py-6">
          {/* Header - Hide for add mode and view&edit mode */}
          {mode !== 'add' && mode !== 'view&edit' && (
            <PageHeader title="Patient Details" showBackButton={true} className="mb-6" />
          )}

          <div className="max-w-6xl">
            {/* Patient Details Section */}
            <div className="mb-8">
              {/* Title and description for view&edit mode */}
              {isViewEditMode ? (
                <>
                  <h2 className="font-gotham-bold text-base 2xl:text-lg text-secondary mb-2">
                    Patient Details
                  </h2>
                  <p className="font-gotham text-sm text-muted mb-8">
                    All the key information you need to care for this patient.
                  </p>
                </>
              ) : (
                mode !== 'add' && (
                  <h2 className="font-gotham-bold text-sm 2xl:text-base text-secondary mb-6">
                    Patient Details
                  </h2>
                )
              )}

              {/* Grid Layout - Responsive based on mode */}
              <div
                className={`grid gap-6 mb-6 ${isViewEditMode ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-6' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}
              >
                {/* Last Name */}

                <div>
                  {isReadOnly ? (
                    <>
                      <label className="block font-gotham text-sm text-muted mb-2">Last Name</label>
                      <div className="font-gotham-medium text-base 2xl:text-lg text-secondary">
                        {lastname
                          ? lastname.toString().charAt(0).toUpperCase() +
                            lastname.toString().toLowerCase().slice(1)
                          : '-'}
                      </div>
                    </>
                  ) : (
                    <InputField
                      label="Last Name"
                      placeholder="Last Name"
                      alphaOnly
                      value={
                        lastname
                          ? lastname.toString().charAt(0).toUpperCase() +
                            lastname.toString().toLowerCase().slice(1)
                          : ''
                      }
                      onChange={(e) => handlePatientOnChange('lastname', e.target.value)}
                      required={!isViewEditMode}
                      className={
                        (autoFillChoice || subMode === 'addMultiplePatients') && !lastname
                          ? 'border-error-custom'
                          : ''
                      }
                    />
                  )}
                </div>
                {/* First Name */}
                <div>
                  {isReadOnly ? (
                    <>
                      <label className="block font-gotham text-sm text-muted mb-2">
                        First Name
                      </label>
                      <div className="font-gotham-medium text-base 2xl:text-lg text-secondary">
                        {firstname
                          ? firstname.toString().charAt(0).toUpperCase() +
                            firstname.toString().toLowerCase().slice(1)
                          : '-'}
                      </div>
                    </>
                  ) : (
                    <InputField
                      label="First Name"
                      placeholder="First Name"
                      alphaOnly
                      value={
                        firstname
                          ? firstname.toString().charAt(0).toUpperCase() +
                            firstname.toString().toLowerCase().slice(1)
                          : ''
                      }
                      onChange={(e) => handlePatientOnChange('firstname', e.target.value)}
                      required={!isViewEditMode}
                      className={
                        (autoFillChoice || subMode === 'addMultiplePatients') && !firstname
                          ? 'border-error-custom'
                          : ''
                      }
                    />
                  )}
                </div>

                {/* Middle Name */}
                <div>
                  {isReadOnly ? (
                    <>
                      <label className="block font-gotham text-sm text-muted mb-2">
                        Middle Name
                      </label>
                      <div className="font-gotham-medium text-base 2xl:text-lg text-secondary">
                        {middlename
                          ? middlename.toString().charAt(0).toUpperCase() +
                            middlename.toString().toLowerCase().slice(1)
                          : '-'}
                      </div>
                    </>
                  ) : (
                    <InputField
                      label="Middle Name"
                      placeholder="Middle Name"
                      alphaOnly
                      value={
                        middlename
                          ? middlename.toString().charAt(0).toUpperCase() +
                            middlename.toString().toLowerCase().slice(1)
                          : ''
                      }
                      onChange={(e) => handlePatientOnChange('middlename', e.target.value)}
                    />
                  )}
                </div>

                {/* Status - Only show in view&edit mode in first row */}
                {isViewEditMode && (
                  <div>
                    <label className="block font-gotham text-sm text-muted mb-2">Status</label>
                    {isReadOnly ? (
                      <div className="font-gotham-medium text-base 2xl:text-lg text-secondary">
                        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Active'}
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant={status === 'active' ? 'primary' : 'white'}
                          onClick={() => handleStatusClick('active')}
                          className="flex-1 text-xs"
                          paddingLevel={2}
                        >
                          Active
                        </Button>
                        <Button
                          variant={status === 'inactive' ? 'primary' : 'white'}
                          onClick={() => handleStatusClick('inactive')}
                          className="flex-1 text-xs"
                          paddingLevel={2}
                        >
                          Inactive
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Second Row: Date of Birth, Age, Gender, Admit Date - Only show in view&edit mode */}
              {isViewEditMode && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-6 mb-6">
                  {/* Date of Birth */}
                  <div>
                    {isReadOnly ? (
                      <>
                        <label className="block font-gotham text-sm text-muted mb-2">
                          Date of Birth
                        </label>
                        <div className="font-gotham-medium text-base 2xl:text-lg text-secondary">
                          {dateofbirth && isDateValid(dateofbirth)
                            ? formatDisplayDate(dateofbirth)
                            : '-'}{' '}
                        </div>
                      </>
                    ) : (
                      <InputField
                        label="Date of Birth"
                        type="date"
                        placeholder="mm/dd/yyyy"
                        value={
                          dateofbirth && isDateValid(dateofbirth) ? formatISODate(dateofbirth) : ''
                        }
                        onChange={(e) => handlePatientOnChange('dateofbirth', e.target.value)}
                      />
                    )}
                  </div>

                  {/* Age */}
                  <div>
                    {isReadOnly ? (
                      <>
                        <label className="block font-gotham text-sm text-muted mb-2">Age</label>
                        <div className="font-gotham-medium text-base 2xl:text-lg text-secondary">
                          {age !== null ? age.toString() : '-'}
                        </div>
                      </>
                    ) : (
                      <InputField
                        label="Age"
                        placeholder="Age"
                        value={age !== null ? age.toString() : ''}
                        readOnly={true}
                      />
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block font-gotham text-sm text-muted mb-2">Gender</label>
                    {isReadOnly ? (
                      <div className="font-gotham-medium text-base 2xl:text-lg text-secondary">
                        {gender
                          ? gender.toLowerCase() === 'male' || gender.toLowerCase() === 'm'
                            ? 'Male'
                            : gender.toLowerCase() === 'female' || gender.toLowerCase() === 'f'
                              ? 'Female'
                              : gender.charAt(0).toUpperCase() + gender.slice(1)
                          : '-'}
                      </div>
                    ) : (
                      <Dropdown
                        options={genderOptions}
                        value={gender ?? ''}
                        onChange={(val) => handlePatientOnChange('gender', val.toString())}
                        placeholder="Select Gender"
                        fullWidth
                      />
                    )}
                  </div>

                  {/* Empty fourth column for spacing */}
                  <div></div>
                </div>
              )}

              {/* Add mode: DOB, Age, Gender in 3-column layout */}
              {!isViewEditMode && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
                  <div>
                    <InputField
                      label="DOB"
                      type="date"
                      placeholder="mm/dd/yyyy"
                      value={
                        dateofbirth && isDateValid(dateofbirth) ? formatISODate(dateofbirth) : ''
                      }
                      onChange={(e) => handlePatientOnChange('dateofbirth', e.target.value)}
                      required
                      className={
                        (autoFillChoice || subMode === 'addMultiplePatients') && !dateofbirth
                          ? 'border-error-custom'
                          : ''
                      }
                    />
                  </div>

                  <div>
                    <InputField
                      label="Age"
                      placeholder="Age"
                      value={age !== null ? age.toString() : ''}
                      readOnly={true}
                    />
                  </div>

                  <div>
                    <label className="block text-xs 2xl:text-sm font-gotham-medium text-secondary mb-3">
                      Gender
                    </label>
                    <Dropdown
                      options={genderOptions}
                      value={gender ?? ''}
                      onChange={(val) => handlePatientOnChange('gender', val.toString())}
                      placeholder="Select Gender"
                      fullWidth
                    />
                  </div>

                  {/* Admit Date */}
                  <div>
                    <InputField
                      label="Admit Date"
                      type="date"
                      placeholder="mm/dd/yyyy"
                      value={admitdate && isDateValid(admitdate) ? formatISODate(admitdate) : ''}
                      onChange={(e) => handlePatientOnChange('admitdate', e.target.value)}
                      required
                      className={
                        (autoFillChoice || subMode === 'addMultiplePatients') && !admitdate
                          ? 'border-error-custom'
                          : ''
                      }
                    />
                  </div>
                </div>
              )}

              {/* Two Column Grid - Third Row: Hospital Facility Name, Provider */}
              {mode === 'add' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-xs 2xl:text-sm font-gotham-medium text-secondary mb-3">
                      Hospital Facility Name<span className="required ml-1">*</span>
                    </label>
                    <Dropdown
                      options={hospitalOptions}
                      value={hospital_id?.toString() ?? ''}
                      onChange={(val) => handlePatientOnChange('hospital_id', val.toString())}
                      placeholder="Select Place of Service"
                      fullWidth
                      className={
                        (autoFillChoice || subMode === 'addMultiplePatients') && !hospital_id
                          ? 'border-error-custom'
                          : ''
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs 2xl:text-sm font-gotham-medium text-secondary mb-3">
                      Provider<span className="required ml-1">*</span>
                    </label>
                    <Dropdown
                      options={providerOptions}
                      value={provider.id?.toString() ?? ''}
                      onChange={(val) => handlePatientOnChange('provider', val.toString())}
                      placeholder="Select Provider"
                      fullWidth
                      className={
                        (autoFillChoice || subMode === 'addMultiplePatients') && !provider
                          ? 'border-error-custom'
                          : ''
                      }
                    />
                  </div>
                </div>
              )}

              {/* Add Diagnosis Button - Positioned to the right */}
              {mode === 'add' && (
                <div className="mb-8 flex justify-end">
                  <Button
                    variant="primary"
                    icon={PlusIcon}
                    onClick={() => setShowDiagnosis(true)}
                    className="px-6"
                    // onClick={() => diagnosisToggleModal && diagnosisToggleModal()}
                  >
                    Add Diagnosis
                  </Button>
                </div>
              )}
            </div>

            {/* Diagnosis Section */}
            {mode === 'add' && (
              <>
                <div className="mb-8">
                  <DiagnosisComponent
                    open={showDiagnosis}
                    onClose={() => setShowDiagnosis(false)}
                    DiagnosisArray={selectedDiagnosis}
                    handleSelectedDiagnosis={handleSelectedDiagnosis}
                  />
                </div>

                {/* Display selected diagnoses below the modal trigger */}
                {selectedDiagnosis.length > 0 && (
                  <div className="mb-8">
                    <h3 className="font-gotham-medium text-sm 2xl:text-base text-secondary mb-4">
                      Selected Diagnosis
                    </h3>
                    <div className="border border-[rgba(43,53,61,0.1)] rounded-2xl divide-y divide-[rgba(43,53,61,0.1)]">
                      {selectedDiagnosis
                        .slice()
                        .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
                        .map((item) => (
                          <div
                            key={item.id}
                            className="flex cursor-pointer items-center gap-1 px-4 py-2 text-xs sm:text-sm 2xl:text-base text-secondary"
                          >
                            {item.is_primary && <span className="text-error">*</span>}
                            <span>
                              <span className="font-gotham-medium text-primary">{item.code}</span>:{' '}
                              {item.description}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Horizontal Divider - Full Width - Hide for view&edit mode */}
        {!isViewEditMode && <hr className="border-t border-gray-200 mb-8" />}

        <div className="px-4 sm:px-6">
          <div className="max-w-6xl mx-auto">
            {/* Visit Type and Status Section - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Visit Type Section */}
              {mode === 'add' && (
                <div>
                  <h3 className="font-gotham-medium text-sm 2xl:text-base text-secondary mb-4">
                    Visit Type<span className="required ml-1">*</span>
                  </h3>
                  <div className="flex gap-4">
                    <Button
                      variant={visittype === 'inpatient' ? 'primary' : 'white'}
                      onClick={() => handleVisitTypeClick('inpatient')}
                      className="flex-1"
                      disabled={!isEditable}
                    >
                      Inpatient
                    </Button>
                    <Button
                      variant={visittype === 'consult' ? 'primary' : 'white'}
                      onClick={() => handleVisitTypeClick('consult')}
                      className="flex-1"
                      disabled={!isEditable}
                    >
                      Consult
                    </Button>
                  </div>
                </div>
              )}

              {/* Status Section - Only for add mode */}
              {!isViewEditMode && (
                <div>
                  <h3 className="font-gotham-medium text-sm 2xl:text-base text-secondary mb-4">
                    Status
                  </h3>
                  <div className="flex gap-4">
                    <Button
                      variant={status === 'active' ? 'primary' : 'white'}
                      onClick={() => handleStatusClick('active')}
                      className="flex-1"
                    >
                      Active
                    </Button>
                    <Button
                      variant={status === 'inactive' ? 'primary' : 'white'}
                      onClick={() => handleStatusClick('inactive')}
                      className="flex-1"
                    >
                      Inactive
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Checkbox */}
            {mode === 'add' && subMode !== 'addMultiplePatients' && (
              <Checkbox
                id="addToCharges"
                checked={addPatientToChargesPage}
                onChange={setAddPatientToChargesPage}
                label="Add this patient to charge page"
                className="mb-8"
                labelClassName="text-sm"
              />
            )}
          </div>
        </div>

        {/* Horizontal Divider and Save Button - Full Width */}
        {loading ? (
          <div className="px-4 sm:px-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex justify-center py-4">
                <Loader />
              </div>
            </div>
          </div>
        ) : (
          (mode === 'add' || isEditMode) &&
          subMode !== 'addMultiplePatients' && (
            <>
              {!isViewEditMode && <hr className="border-t border-gray-200 mb-8" />}
              <div className="px-4 sm:px-6 pb-6">
                <div className="max-w-6xl mx-auto">
                  <div className="flex justify-center">
                    <Button
                      variant="primary"
                      loading={saveLoading}
                      onClick={() =>
                        isViewEditMode ? handleCommonPatientDetails() : handleSaveWithAdmitCheck()
                      }
                      className={isViewEditMode ? 'w-full max-w-md' : 'w-full'}
                      paddingLevel={4}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )
        )}

        {/* Admission date >90 days confirmation modal */}
        <ConfirmationModal
          open={showAdmitWarning}
          onClose={() => setShowAdmitWarning(false)}
          onConfirm={() => {
            setShowAdmitWarning(false);
            submitForm();
          }}
          title="Warning"
          message="Warning: The admission date entered is over 90 days old. If this is correct, click Confirm. Otherwise, please review and update the date."
          confirmText="Confirm"
          cancelText="Back"
        />

        <ConfirmationModal
          open={showFutureAdmitError}
          onClose={() => setShowFutureAdmitError(false)}
          onConfirm={() => setShowFutureAdmitError(false)}
          title="Admit Date Error"
          message="Admit date cannot be in the future. Please review and update the date."
          confirmText="Close"
          cancelText="Back"
        />

        {/* Duplicate patient confirmation modal */}
        <ConfirmationModal
          open={showCreateAdmissionModal}
          onClose={() => setShowCreateAdmissionModal(false)}
          onConfirm={handleCreateAdmissionConfirm}
          title="Existing Patient Found"
          message={duplicateMessage}
          confirmText={loading ? 'Creating...' : 'Create Admission'}
          cancelText="Cancel"
          hideCancelButton={loading}
        />

        {/* DOB validation confirmation modal */}
        <ConfirmationModal
          open={dobWarningType !== null}
          onClose={() => setDobWarningType(null)}
          onConfirm={() => {
            if (dobWarningType === 'future') {
              setDobWarningType(null);
              return;
            }
            const fn = pendingSaveRef.current;
            setDobWarningType(null);
            fn();
          }}
          title="Date of Birth Warning"
          message={
            dobWarningType === 'under'
              ? 'Patient is under 18 years old. Do you want to continue?'
              : dobWarningType === 'over'
                ? 'Patient age appears to be greater than 130 years. Do you want to continue?'
                : 'Date of Birth cannot be in the future. Please review and update the date.'
          }
          confirmText={dobWarningType === 'future' ? 'Close' : 'Continue'}
          cancelText={dobWarningType === 'future' ? 'Back' : 'Back'}
        />
      </div>
    );
  },
);

export default PatientDetails;

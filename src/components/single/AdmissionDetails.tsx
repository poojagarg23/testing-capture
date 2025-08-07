import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  convertToCalendarSpecificDate,
  handleDates,
  fetchPatientDiagnoses,
  saveDiagnosis,
  formatProviderName,
  authorizedTitles,
  fetchUserDetails,
  fetchAuthorizedProviders,
  fetchHospitals,
  deleteFacesheet,
  ViewFacesheet,
  uploadFacesheetApi,
} from '../../helpers';
import Eye from '../../assets/icons/eye.svg?react';
import Loader from '../reusable/Loader.tsx';
import { toast } from 'react-toastify';
import DiagnosisComponent from '../reusable/Diagnosis.tsx';
import Button from '../reusable/custom/Button';
import type { AdmissionDetailsProps } from '../../types/AdmissionDetails.types';
import { Diagnosis, Provider, Hospital } from '../../types/index.ts';
import { AxiosError } from 'axios';
import InputField from '../reusable/custom/InputField';
import Dropdown from '../reusable/custom/Dropdown';
import FileUploadArea from '../reusable/FileUploadArea';
import FileAttachment from '../reusable/FileAttachment';
import VisitTypeToggle from '../reusable/VisitTypeToggle';
import { useNavigate } from 'react-router-dom';
import BackCircle from '../../assets/icons/BackCircle.svg?react';
import BackArrow from '../../assets/icons/BackArrow.svg?react';
import PlusIcon from '../../assets/icons/plus-icon.svg?react';
import {
  formatDisplayDate,
  formatISODate,
  isDateValid,
  isOlderThanNDays,
} from '../../helpers/dateUtils.ts';
import { TOAST_CONFIG } from '../../constants/index.ts';
import { capitalizeVisitType } from '../../helpers/index.ts';
import ConfirmationModal from '../reusable/ConfirmationModal';

interface InfoBlockProps {
  label: string;
  value: React.ReactNode | string | number | null | undefined;
}

const InfoBlock: React.FC<InfoBlockProps> = ({ label, value }) => (
  <div className="transition-all">
    <p className="text-xs text-secondary font-gotham-medium 2xl:text-lg opacity-60 mb-1">{label}</p>
    <div className="font-gotham-medium text-secondary text-sm sm:text-base">
      {value !== null && value !== undefined && value !== '' ? value : '—'}
    </div>
  </div>
);

export type AdmissionDetailsHandle = {
  hasUnsavedChanges: () => boolean;
  resetUnsavedChanges: () => void;
  discardChanges: () => void;
};

const AdmissionDetails = forwardRef<AdmissionDetailsHandle, AdmissionDetailsProps>(
  ({ patient, subMode, mode, onBack: _onBack }, ref) => {
    const [admitdate, setAdmitDate] = useState<string | null>(
      patient && patient.admitdate ? convertToCalendarSpecificDate(patient.admitdate) : null,
    );
    const [room, setRoom] = useState<string | null>(patient && patient.room ? patient.room : null);
    const [location, setLocation] = useState<number | null>(
      patient && patient.hospital_id ? patient?.hospital_id : null,
    );
    const [dischargedate, setDischargeDate] = useState<string | null>(
      patient && patient.dischargedate
        ? convertToCalendarSpecificDate(patient.dischargedate)
        : null,
    );
    const [visittype, setVisitType] = useState<string | null>(
      patient && patient.visittype ? patient.visittype : 'Inpatient',
    );
    const [facesheet, setFacesheet] = useState<File | null>(null);
    const [facesheetalias, setFacesheetAlias] = useState<string | null>(
      patient && patient.facesheetalias ? patient.facesheetalias : null,
    );
    const [owningProvider, setOwningProvider] = useState<number | null>(
      patient && patient.owning_provider_id ? patient.owning_provider_id : null,
    );
    const [selectedDiagnosis, setSelectedDiagnosis] = useState<Diagnosis[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [admission_id, setAdmissionId] = useState<number | null>(patient.id ? patient.id : null);
    const [authorizedProviders, setAuthorizedProviders] = useState<Provider[]>([]);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [loadingFacesheet, setLoadingFacesheet] = useState<boolean>(false);
    const [deletingFacesheet, setDeletingFacesheet] = useState<boolean>(false);
    const [showDiagnosis, setShowDiagnosis] = useState(false);
    const [dragActive, setDragActive] = useState<boolean>(false);
    const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
    const [showAdmitWarning, setShowAdmitWarning] = useState<boolean>(false);
    const [showFutureAdmitError, setShowFutureAdmitError] = useState<boolean>(false);

    const oldAdmissionDataRef = useRef<typeof patient>(JSON.parse(JSON.stringify(patient)));

    /* ----------------------------- Navigation ----------------------------- */
    const navigate = useNavigate();

    const handleBack = () => {
      if (typeof _onBack === 'function') {
        _onBack();
      } else {
        navigate(-1);
      }
    };

    const handlePatientOnChange = useCallback(
      (patient_key: string, value: string | number) => {
        setUnsavedChanges(true);
        if (patient_key === 'room') {
          setRoom(value as string);
          patient.room = value as string;
        }

        if (patient_key === 'location') {
          const numValue = value === '' ? null : Number(value);
          setLocation(numValue);
          patient.hospital_id = numValue as number;
        }

        if (patient_key === 'admitdate') {
          setAdmitDate(value as string);
          const newValue = handleDates(admitdate, mode, subMode);
          // Fix for Error #1 - Type 'string | undefined' is not assignable to type 'string | Date | null'
          patient.admitdate = newValue || null;
        }

        if (patient_key === 'dischargedate') {
          setDischargeDate(value as string);
          const newValue = handleDates(dischargedate, mode, subMode);
          patient.dischargedate = newValue;
        }

        if (patient_key === 'visittype') {
          setVisitType(value as string);
          patient.visittype = value as string;
        }

        if (patient_key === 'owning_provider_id') {
          const numValue = value === '' ? null : Number(value); // Convert empty string to null
          setOwningProvider(numValue);
          patient.owning_provider_id = numValue as number;
        }
      },
      [admitdate, dischargedate, mode, subMode, patient],
    );

    const handleFetchAuthorizedProviders = useCallback(async () => {
      try {
        const [userData, providers, hospitals] = await Promise.all([
          fetchUserDetails(),
          fetchAuthorizedProviders(),
          fetchHospitals(),
        ]);

        if (userData && providers && hospitals) {
          setAuthorizedProviders(providers);
          setHospitals(hospitals);
          if (mode === 'add') {
            if (authorizedTitles.includes(userData.title)) {
              setOwningProvider(userData.id);
              handlePatientOnChange('owning_provider_id', userData.id);
            }
          }
        }
      } catch (error) {
        console.warn(error);
      }
    }, [handlePatientOnChange, mode]);

    useEffect(() => {
      handleFetchAuthorizedProviders();
    }, [handleFetchAuthorizedProviders]);

    useEffect(() => {
      if (admission_id && mode !== 'add') {
        fetchPatientDiagnoses(admission_id).then((diagnoses) => {
          setSelectedDiagnosis(diagnoses as Diagnosis[]);
        });
      }
    }, [admission_id, mode]);

    const handleViewFacesheet = async () => {
      setLoadingFacesheet(true);
      try {
        const url = await ViewFacesheet(admission_id, facesheetalias);
        window.open(url, '_blank');
      } catch (error) {
        console.error('Error:', error);
        toast.error('Network error', TOAST_CONFIG.ERROR);
      } finally {
        setLoadingFacesheet(false);
      }
    };

    const handleDeleteFacesheet = async () => {
      if (!admission_id || !facesheetalias) return;
      setDeletingFacesheet(true);
      const res = await deleteFacesheet(admission_id, facesheetalias);
      if (res.success) {
        toast.success('Face sheet deleted successfully', TOAST_CONFIG.SUCCESS);
        setFacesheetAlias(null);
        setFacesheet(null);
        patient.facesheetalias = null;
      } else {
        toast.error('Error deleting facesheet', TOAST_CONFIG.ERROR);
      }
      setDeletingFacesheet(false);
    };

    const uploadFacesheet = async (file: File | null) => {
      const formData = new FormData();
      formData.append('admission_page', 'true');

      // Fix for error #2-8 - FormData.append with null values
      // Convert all potentially null/undefined values to strings for FormData
      formData.append('admitdate', admitdate || '');
      formData.append('hospital_id', location ? location.toString() : '');
      formData.append('owning_provider_id', owningProvider ? owningProvider.toString() : '');
      formData.append('visittype', visittype || '');
      if (dischargedate) {
        formData.append('dischargedate', dischargedate);
      }
      formData.append('room', room || '');
      formData.append('facesheetalias', facesheetalias || '');
      formData.append('amd_patient_id', patient.amd_patient_id || '');

      if (file) {
        formData.append('facesheet', file);
      }

      if (admission_id) {
        formData.append('admission_id', String(admission_id));
      } else {
        formData.append('patient_id', String(patient.patient_id));
      }

      try {
        const response = await uploadFacesheetApi(formData);
        if (file) {
          toast.success('Face sheet uploaded successfully', TOAST_CONFIG.SUCCESS);
        }
        patient.facesheetalias = response.facesheetalias;
        if (response.facesheetalias) {
          setFacesheetAlias(response.facesheetalias);
        }
        setAdmissionId(response.id);
        return response;
      } catch (error) {
        if (error instanceof AxiosError) {
          setLoading(false);
          toast.error(
            error?.response?.data?.message || 'An error occurred while uploading the facesheet.',
            TOAST_CONFIG.ERROR,
          );
          console.error(error);
        }
      } finally {
        setLoading(false);
      }
    };

    const handleFacesheetSelect = (file: File) => {
      if (
        facesheet &&
        facesheet.name === file.name &&
        facesheet.size === file.size &&
        facesheet.lastModified === file.lastModified
      ) {
        toast.error(
          `${file.name} has already been selected. Please choose a different file.`,
          TOAST_CONFIG.ERROR,
        );
        return;
      }
      setFacesheet(file);
    };

    const savePatientDetails = async (
      e: React.FormEvent<HTMLFormElement> | null,
      bypassWarning: boolean = false,
    ) => {
      if (e) {
        e.preventDefault();
      }
      if (!owningProvider) {
        toast.error('Please select owning provider', TOAST_CONFIG.ERROR);
        return;
      }

      if (!location) {
        toast.error('Please select Place of Service', TOAST_CONFIG.ERROR);
        return;
      }

      if (!visittype) {
        toast.error('Please select visit type', TOAST_CONFIG.ERROR);
        return;
      }

      if (admitdate) {
        const admit = new Date(admitdate);
        const today = new Date();
        admit.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        if (admit > today) {
          setShowFutureAdmitError(true);
          return;
        }
      }

      if (dischargedate) {
        const discharge = new Date(dischargedate);
        const today = new Date();

        discharge.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        if (discharge.getTime() === today.getTime()) {
          toast.error('Discharge date cannot be today', TOAST_CONFIG.ERROR);
          return;
        }

        if (admitdate) {
          const admit = new Date(admitdate);
          admit.setHours(0, 0, 0, 0);
          if (discharge < admit) {
            toast.error('Discharge date cannot be before admit date', TOAST_CONFIG.ERROR);
            return;
          }
        }
      }

      // Admission Date older than 90 days confirmation
      if (
        !bypassWarning &&
        admitdate &&
        isDateValid(admitdate) &&
        isOlderThanNDays(admitdate, 90)
      ) {
        setShowAdmitWarning(true);
        return;
      }

      try {
        setLoading(true);
        const res = await uploadFacesheet(facesheet);

        // Optimistically mark clean to avoid prompt after clicking save
        setUnsavedChanges(false);

        // Fix for error #10 - res is possibly 'undefined'
        if (res && res.id) {
          const result = await saveDiagnosis(res.id, selectedDiagnosis);
          if (result) {
            toast.success('Diagnoses Saved Successfully!', TOAST_CONFIG.SUCCESS);
          }
          toast.success('Admission details saved successfully', TOAST_CONFIG.SUCCESS);

          // Reset unsaved flag and update baseline
          setUnsavedChanges(false);
          oldAdmissionDataRef.current = JSON.parse(JSON.stringify(patient));

          // Clear the form for a fresh entry when adding a new admission
          if (mode === 'add') {
            resetForm();
          }
        } else {
          toast.error('Failed to save admission details', TOAST_CONFIG.ERROR);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.warn(error);
        toast.error('Failed to save admission details', TOAST_CONFIG.ERROR);
      }
    };

    const handleSelectedDiagnosis = async (diagArray: Diagnosis[]) => {
      patient.selectedDiagnosis = diagArray;
      setSelectedDiagnosis(diagArray);

      // Persist diagnosis changes immediately in VIEW mode only to avoid duplicate saves in Edit mode
      if (isViewMode && admission_id) {
        try {
          const result = await saveDiagnosis(admission_id, diagArray);
          if (result) {
            toast.success('Diagnoses Saved Successfully!', TOAST_CONFIG.SUCCESS);
          } else {
            toast.error('Failed to save diagnosis', TOAST_CONFIG.ERROR);
          }
        } catch (error) {
          console.error('Error saving diagnosis:', error);
          toast.error('Failed to save diagnosis', TOAST_CONFIG.ERROR);
        }
      }
    };

    /* ----------------------------- Helper: Reset Form ----------------------------- */
    const resetForm = () => {
      setAdmitDate(null);
      setRoom(null);
      setLocation(null);
      setDischargeDate(null);
      setVisitType('Inpatient');
      setFacesheet(null);
      setFacesheetAlias(null);
      setOwningProvider(null);
      setSelectedDiagnosis([]);
      setAdmissionId(null);

      // Also reset mutable patient object fields to keep it in sync
      patient.admitdate = null;
      patient.room = null;
      patient.hospital_id = null as unknown as number;
      patient.dischargedate = null;
      patient.visittype = 'Inpatient';
      patient.facesheetalias = null;
      patient.owning_provider_id = null as unknown as number;
      patient.selectedDiagnosis = [];
    };

    const isViewMode = subMode === 'view';
    const isAddMode = mode === 'add';

    const providerObj = authorizedProviders.find((p) => p.id === owningProvider);
    const providerNameDisplay = providerObj ? formatProviderName(providerObj) : '—';

    // Get hospital name for the currently selected location id
    const hospitalObj = hospitals.find((h) => h.id === location);
    const locationNameDisplay = hospitalObj ? hospitalObj.hospital : '—';

    let headingTitle: string;
    let headingSubtitle: string;
    let headingClasses: string;
    let subtitleClasses: string;

    if (isViewMode) {
      headingTitle = 'Admission Details';
      headingSubtitle = 'All the details about when and why the patient was admitted.';
      headingClasses = 'font-gotham-medium text-base 2xl:text-lg text-secondary';
      subtitleClasses = 'font-gotham text-sm text-muted';
    } else if (isAddMode) {
      headingTitle = 'New Admission';
      headingSubtitle = 'Add a new patient to the system and begin their care journey.';
      headingClasses = 'font-gotham-bold text-secondary text-2xl 2xl:text-3xl';
      subtitleClasses = 'font-gotham-book text-secondary text-sm opacity-60';
    } else {
      // Editing existing admission
      headingTitle = 'Edit Admission Details';
      headingSubtitle = 'Modify admission information as needed.';
      headingClasses = 'font-gotham-medium text-base 2xl:text-lg text-secondary';
      subtitleClasses = 'font-gotham text-sm text-muted';
    }

    // applyOriginalAdmission to revert
    const applyOriginalAdmissionData = (original: typeof patient) => {
      setAdmitDate(
        original && original.admitdate ? convertToCalendarSpecificDate(original.admitdate) : null,
      );
      setRoom(original && original.room ? original.room : null);
      setLocation(original && original.hospital_id ? original.hospital_id : null);
      setDischargeDate(
        original && original.dischargedate
          ? convertToCalendarSpecificDate(original.dischargedate)
          : null,
      );
      setVisitType(original && original.visittype ? original.visittype : 'Inpatient');
      setFacesheetAlias(original && original.facesheetalias ? original.facesheetalias : null);
      setOwningProvider(
        original && original.owning_provider_id ? original.owning_provider_id : null,
      );
      setSelectedDiagnosis(original?.diagnoses || []);

      // update patient object
      Object.assign(patient, JSON.parse(JSON.stringify(original)));
    };

    useImperativeHandle(
      ref,
      () => ({
        hasUnsavedChanges: () => unsavedChanges,
        resetUnsavedChanges: () => setUnsavedChanges(false),
        discardChanges: () => {
          applyOriginalAdmissionData(oldAdmissionDataRef.current);
          setUnsavedChanges(false);
        },
      }),
      [unsavedChanges],
    );

    return (
      <div className="flex flex-col gap-8  md:gap-10">
        {/* Heading with Back Button */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-start gap-2 mb-2">
            <button
              onClick={handleBack}
              type="button"
              aria-label="Go back"
              className="relative w-8 h-9 cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
            >
              <div className="absolute inset-0">
                <BackCircle className="block max-w-none size-full text-secondary" />
              </div>
              <div className="absolute inset-1/4">
                <BackArrow className="block max-w-none size-full text-secondary" />
              </div>
            </button>
            <h2 className={headingClasses}>{headingTitle}</h2>
          </div>
          <p className={subtitleClasses}>{headingSubtitle}</p>
        </div>
        {isViewMode && (
          <div className="flex flex-col gap-6 sm:gap-8 p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
              {/* Admit Date */}
              <InfoBlock
                label="Admit Date"
                value={isDateValid(admitdate) && formatDisplayDate(admitdate)}
              />

              {/* Room */}
              <InfoBlock label="Room" value={room} />

              {/* Discharge Date */}
              <InfoBlock
                label="Discharge Date"
                value={isDateValid(dischargedate) && formatDisplayDate(dischargedate)}
              />

              {/* Owning Provider */}
              <InfoBlock label="Owning Provider" value={providerNameDisplay} />

              {/* Visit Type */}
              <InfoBlock label="Visit Type" value={capitalizeVisitType(visittype || '')} />
              <InfoBlock label="Place of Service" value={locationNameDisplay} />

              <InfoBlock
                label="Face Sheet"
                value={
                  facesheetalias ? (
                    <button
                      type="button"
                      onClick={handleViewFacesheet}
                      disabled={loadingFacesheet}
                      className="w-9 h-9 lg:w-10 lg:h-10 bg-[#24A5DF] cursor-pointer ml-5 hover:bg-[#127DC3] disabled:opacity-60 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-colors"
                      aria-label="View facesheet"
                    >
                      <Eye fill="white" className="w-4 h-4 lg:w-5 lg:h-5" />
                    </button>
                  ) : (
                    '—'
                  )
                }
              />
              <div className="flex flex-col gap-2">
                <label className="text-xs text-secondary font-gotham-medium 2xl:text-lg opacity-60 mb-1">
                  Diagnosis
                </label>
                <Button
                  size="large"
                  type="button"
                  variant="primary"
                  onClick={() => setShowDiagnosis(true)}
                  icon={PlusIcon}
                  paddingLevel={5}
                  className="whitespace-nowrap sm:w-auto"
                >
                  Add Diagnosis
                </Button>
              </div>

              {/* Diagnoses */}
              <div className="col-span-full">
                <p className="text-xs text-secondary opacity-60 2xl:text-lg font-gotham-medium mb-2">
                  Diagnoses
                </p>
                {selectedDiagnosis.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDiagnosis
                      .slice()
                      .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
                      .map((diag, idx) => (
                        <div
                          key={idx}
                          className="text-sm font-gotham-medium border border-subtle w-fit text-secondary flex items-start hover-bg-subtle p-2 rounded-xl 2xl:text-lg transition-all"
                        >
                          {diag.is_primary && <span className="text-error mr-1">*</span>}
                          <span>
                            <span className="font-gotham-medium text-primary">{diag.code}</span> —{' '}
                            {diag.description}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <span className="text-secondary">—</span>
                )}
              </div>
            </div>
          </div>
        )}

        {!isViewMode && (
          /* ------------------------ EDIT / ADD FORM LAYOUT ------------------------ */
          <form onSubmit={(e) => savePatientDetails(e)} className="flex flex-col gap-6">
            {/* Row 1: 3 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Admit Date */}
              <InputField
                label="Admit Date"
                type="date"
                value={admitdate && isDateValid(admitdate) ? formatISODate(admitdate) : ''}
                onChange={(e) => handlePatientOnChange('admitdate', e.target.value)}
                required
              />

              {/* Room */}
              <InputField
                label="Room"
                type="text"
                value={room || ''}
                onChange={(e) => handlePatientOnChange('room', e.target.value)}
                placeholder="Enter room number"
              />

              {/* Place of Service */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-secondary">
                  Select Place of Service <span className="text-error">*</span>
                </label>
                <Dropdown
                  options={hospitals.map((hospital) => ({
                    label: hospital.hospital,
                    value: hospital.id,
                  }))}
                  value={typeof location === 'number' ? location : ''}
                  onChange={(val) => {
                    if (typeof val === 'string' || typeof val === 'number')
                      handlePatientOnChange('location', val);
                  }}
                  placeholder="Select Place of Service"
                  fullWidth
                />
              </div>
            </div>

            {/* Row 2: 4 columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Discharge Date */}
              <InputField
                type="date"
                label="Discharge Date"
                value={
                  dischargedate && isDateValid(dischargedate) ? formatISODate(dischargedate) : ''
                }
                onChange={(e) => handlePatientOnChange('dischargedate', e.target.value)}
              />

              {/* Owning Provider */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-secondary">
                  Select Owning Provider <span className="text-error">*</span>
                </label>
                <Dropdown
                  options={authorizedProviders.map((provider) => ({
                    label: formatProviderName(provider),
                    value: provider.id,
                  }))}
                  value={typeof owningProvider === 'number' ? owningProvider : ''}
                  onChange={(val) => {
                    if (typeof val === 'string' || typeof val === 'number')
                      handlePatientOnChange('owning_provider_id', val);
                  }}
                  placeholder="Select Owning Provider"
                  fullWidth
                />
              </div>

              {/* Visit Type */}
              <VisitTypeToggle
                value={visittype}
                onChange={(value) => handlePatientOnChange('visittype', value)}
                required={true}
                label="Visit Type"
              />

              {/* Add Diagnosis */}
              <div className="flex flex-col gap-2">
                <label className="block text-xs 2xl:text-sm text-secondary ">Diagnosis</label>
                <Button
                  type="button"
                  variant="primary"
                  onClick={() => setShowDiagnosis(true)}
                  icon={PlusIcon}
                  paddingLevel={5}
                  className="whitespace-nowrap sm:w-auto"
                >
                  Add Diagnosis
                </Button>
              </div>
            </div>

            {/* Diagnosis Display */}
            {selectedDiagnosis.length > 0 && (
              <div className="border border-subtle rounded-lg p-4 bg-subtle-2">
                <h4 className="text-sm font-medium text-secondary mb-3">Selected Diagnoses:</h4>
                <div className="space-y-2">
                  {selectedDiagnosis
                    .slice()
                    .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
                    .map((diag, idx) => (
                      <div
                        key={idx}
                        className="text-sm font-gotham-medium border border-subtle w-fit text-secondary flex items-start hover-bg-subtle p-2 rounded-xl 2xl:text-lg transition-all"
                      >
                        {diag.is_primary && <span className="text-error mr-1">*</span>}
                        <span>
                          <span className="font-gotham-medium text-primary">{diag.code}</span> —{' '}
                          {diag.description}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-secondary">Face Sheet</label>

              {/* Edit / Add modes: show upload area when no facesheet present */}
              {!isViewMode && !facesheetalias && (
                <>
                  <FileUploadArea
                    onFileSelect={handleFacesheetSelect}
                    dragActive={dragActive}
                    onDragStateChange={setDragActive}
                    className="mb-2"
                  />
                  {facesheet && (
                    <FileAttachment file={facesheet} onRemove={() => setFacesheet(null)} />
                  )}
                </>
              )}
              {/* Show existing facesheet alias in edit mode using reusable FileAttachment */}
              {!isViewMode && facesheetalias && (
                <FileAttachment
                  file={new File([], facesheetalias)}
                  onRemove={handleDeleteFacesheet}
                  loading={deletingFacesheet}
                />
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-center">
              <Button
                type="submit"
                variant="primary"
                size="large"
                className="w-[500px]"
                paddingLevel={4}
                disabled={loading}
              >
                {loading ? <Loader /> : 'Save Changes'}
              </Button>
            </div>
          </form>
        )}

        <DiagnosisComponent
          open={showDiagnosis}
          onClose={() => setShowDiagnosis(false)}
          DiagnosisArray={selectedDiagnosis}
          handleSelectedDiagnosis={(diagArray) => {
            handleSelectedDiagnosis(diagArray);
            setShowDiagnosis(false);
          }}
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

        <ConfirmationModal
          open={showAdmitWarning}
          onClose={() => setShowAdmitWarning(false)}
          onConfirm={() => {
            setShowAdmitWarning(false);

            savePatientDetails(null, true);
          }}
          title="Warning"
          message="Warning: The admission date entered is over 90 days old. If this is correct, click Confirm. Otherwise, please review and update the date."
          confirmText="Confirm"
          cancelText="Back"
        />
      </div>
    );
  },
);

export default AdmissionDetails;

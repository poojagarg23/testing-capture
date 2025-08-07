import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import VisitCodeComponent from './VisitCode.tsx';
import DiagnosisCode from './DiagnosisCode.tsx';
import InputField from '../reusable/custom/InputField.tsx';
import Dropdown from '../reusable/custom/Dropdown.tsx';
import Checkbox from '../reusable/custom/Checkbox.tsx';
import Button from '../reusable/custom/Button.tsx';
import {
  convertToCalendarSpecificDate,
  addPatientIdToChargesPage,
  updatePatientOrder,
  fetchSharedVisitUsers,
  attachSharedVisitsToAdmission,
  fetchVisitCodes,
  updatePatientCharges,
} from '../../helpers/index.js';
import {
  fetchLatestAdmissionDetail as getLatestAdmissionDetail,
  createPatientNote,
  updatePatientNote,
  savePatientDiagnoses,
  saveNoteRelationships,
} from '../../helpers/notes/note-form/index.js';
import { VisitCode, Diagnosis, SharedVisit } from '../../types/index';
import { NoteFormProps } from '../../types/Notes.types.ts';
import {
  formatISODate,
  isDateValid,
  isOlderThanNDays,
  parseDate,
} from '../../helpers/dateUtils.ts';
import { TOAST_CONFIG } from '../../constants/index.ts';
import ConfirmationModal from '../reusable/ConfirmationModal.tsx';
import WarningIcon from '../../assets/icons/Warning.svg?react';

interface NoteFormExtendedProps extends NoteFormProps {
  onDirty?: () => void;
  onSaved?: () => void;
}

const NoteForm: React.FC<NoteFormExtendedProps> = ({
  patient,
  mode,
  currentPatientNote,
  macroMateText,
  redirectToNotelist,
  subMode = 'edit',
  onDirty,
  onSaved,
}) => {
  const [admitDate, setAdmitDate] = useState<string>(
    currentPatientNote?.admitdate && mode === 'view&edit'
      ? convertToCalendarSpecificDate(currentPatientNote?.admitdate)
      : '',
  );
  const [selectedVisitCodes, setSelectedVisitCodes] = useState<VisitCode[]>(
    currentPatientNote?.visit_codes && mode === 'view&edit' ? currentPatientNote?.visit_codes : [],
  );
  const [visitCodes, setVisitCodes] = useState<VisitCode[]>([]);
  const [sharedVisitUsers, setSharedVisitUsers] = useState<SharedVisit[]>([]);
  const [selectedDiagnosisCodes, setSelectedDiagnosisCodes] = useState<Diagnosis[]>(
    currentPatientNote?.diagnoses && mode === 'view&edit' ? currentPatientNote?.diagnoses : [],
  );
  const [addToCharges, setAddToCharges] = useState<boolean>(
    currentPatientNote?.add_to_charges && mode === 'view&edit'
      ? currentPatientNote?.add_to_charges
      : true,
  );
  const [loading, setIsLoading] = useState<boolean>(false);
  const [selectedSharedVisit, setSelectedSharedVisit] = useState<string | number>(
    currentPatientNote?.shared_visits && mode === 'view&edit'
      ? currentPatientNote?.shared_visits[0]?.id || ''
      : '',
  );
  const [dateOfService, setDateOfService] = useState<string>(
    currentPatientNote?.date_of_service && mode === 'view&edit'
      ? convertToCalendarSpecificDate(currentPatientNote?.date_of_service)
      : convertToCalendarSpecificDate(new Date().toISOString()),
  );
  const [admissionId, setAdmissionId] = useState<number | null>(
    mode === 'add' ? null : currentPatientNote?.admission_id || null,
  );
  const [showAdmitWarning, setShowAdmitWarning] = useState<boolean>(false);
  const [showFutureAdmitError, setShowFutureAdmitError] = useState<boolean>(false);
  const [showServiceDateError, setShowServiceDateError] = useState<boolean>(false);

  // Determine if form should be read-only
  const isReadOnly = subMode !== 'edit';

  const handleFetchSharedVisitUsers = async (): Promise<void> => {
    try {
      const users = await fetchSharedVisitUsers();
      setSharedVisitUsers(users);
    } catch (error) {
      console.error('Error fetching shared visit users:', error);
    }
  };

  const handleFetchVisitCodes = async (): Promise<void> => {
    try {
      const visitCodes = await fetchVisitCodes();
      setVisitCodes(visitCodes);
    } catch (error) {
      console.error('Error fetching visit codes:', error);
    }
  };

  const fetchLatestAdmissionDetail = useCallback(
    async (patientId: number) => {
      try {
        const data = await getLatestAdmissionDetail(patientId);
        setAdmitDate(convertToCalendarSpecificDate(data?.admitdate));
        setSelectedDiagnosisCodes(data?.diagnoses || []);
        setAdmissionId(data?.admission_id || null);
      } catch (error) {
        setAdmitDate(
          patient.admitdate ? convertToCalendarSpecificDate(patient?.admitdate.toString()) : '',
        );
        console.error(
          'Failed to fetch latest admission:',
          error instanceof Error ? error.message : 'Unknown error',
        );
      }
    },
    [patient?.admitdate],
  );

  useEffect(() => {
    handleFetchVisitCodes();
    handleFetchSharedVisitUsers();
    if (mode === 'add') {
      fetchLatestAdmissionDetail(patient.patient_id);
    }
  }, [currentPatientNote?.patient_id, fetchLatestAdmissionDetail, mode, patient?.patient_id]);

  const updateSelectedCode = (field: string, value: VisitCode | Diagnosis): void => {
    if (field === 'visitCodes') {
      setSelectedVisitCodes((prev) => prev?.filter((item) => item.id !== value.id));
    }
    if (field === 'diagnosisCodes') {
      setSelectedDiagnosisCodes((prev) => prev?.filter((item) => item.id !== value.id));
    }
  };

  const handleChange = (field: string, value: string | boolean | VisitCode | Diagnosis): void => {
    onDirty?.();
    if (field === 'admitDate') setAdmitDate(value as string);
    if (field === 'dateOfService') setDateOfService(value as string);
    if (field === 'visitCodes') {
      setSelectedVisitCodes((prev) => {
        const exists = prev?.some((item) => item.id === (value as VisitCode).id);
        return exists ? prev : [...prev, value as VisitCode];
      });
    }
    if (field === 'diagnosisCodes') {
      setSelectedDiagnosisCodes((prev) => {
        const exists = prev?.some((item) => item.id === (value as Diagnosis).id);
        return exists ? prev : [...prev, value as Diagnosis];
      });
    }
    if (field === 'sharedVisit') setSelectedSharedVisit(value as string);
    if (field === 'addToCharges') setAddToCharges(value as boolean);
  };

  const performSubmit = async () => {
    setIsLoading(true);
    try {
      let notesData;

      if (mode === 'add') {
        notesData = await createPatientNote({
          patient_id: patient.patient_id,
          admitdate: admitDate,
          date_of_service: dateOfService,
          macro_mate_clinical_text: macroMateText,
        });
      } else if (mode === 'view&edit' && currentPatientNote?.id) {
        notesData = await updatePatientNote({
          id: currentPatientNote.id,
          date_of_service: dateOfService,
          admitdate: admitDate,
          macro_mate_clinical_text: macroMateText,
        });
      }

      if (!admissionId) {
        throw new Error('Admission ID is missing');
      }

      const chargesResponse = await addPatientIdToChargesPage(admissionId);
      const chargesData = await chargesResponse.json();

      const apiCalls: Promise<Awaited<ReturnType<typeof attachSharedVisitsToAdmission>>>[] = [];

      if (selectedSharedVisit !== '') {
        apiCalls.push(
          attachSharedVisitsToAdmission([
            {
              admission_id: admissionId,
              sharedVisitId: [Number(selectedSharedVisit)],
              charges_page_id: chargesData.charges_page_id,
            },
          ]),
        );
      }
      if (mode === 'add') {
        apiCalls.push(updatePatientOrder([patient.patient_id]));
      }

      await Promise.all([
        ...apiCalls,
        updatePatientCharges(
          selectedVisitCodes.map((code) => ({
            chargesId: Number(code.id),
            charges_page_id: chargesData.charges_page_id,
            admission_id: admissionId,
          })),
        ),

        savePatientDiagnoses({
          admission_id: admissionId,
          selectedDiagnosis: selectedDiagnosisCodes,
        }),

        saveNoteRelationships({
          patient_note_id: notesData?.patient_notes_id,
          diagnoses: selectedDiagnosisCodes,
          charges: selectedVisitCodes.map((d) => d.id) as number[],
          shared_visits: selectedSharedVisit ? [Number(selectedSharedVisit)] : [],
        }),
      ]);

      toast.success(
        mode === 'add' ? 'Note Added Successfully!' : 'Note Updated Successfully!',
        TOAST_CONFIG.SUCCESS,
      );
      onSaved?.();
      redirectToNotelist();
    } catch (error) {
      toast.error('An error occurred while submitting.', TOAST_CONFIG.ERROR);
      console.error('Submission error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!admitDate) {
      toast.error('Please select an admit date.', TOAST_CONFIG.ERROR);
      return;
    }

    if (selectedVisitCodes.length === 0) {
      toast.error('Please select visit codes.', TOAST_CONFIG.ERROR);
      return;
    }

    if (isDateValid(admitDate)) {
      const admit = new Date(admitDate);
      const today = new Date();
      admit.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (admit > today) {
        setShowFutureAdmitError(true);
        return;
      }
    }
    const admitDateObj = parseDate(admitDate);
    const serviceDateObj = parseDate(dateOfService);
    if (admitDateObj && serviceDateObj && serviceDateObj < admitDateObj) {
      setShowServiceDateError(true);
      return;
    }

    // 90-day old admission warning
    if (isDateValid(admitDate) && isOlderThanNDays(admitDate, 90)) {
      setShowAdmitWarning(true);
      return;
    }

    // Proceed with actual submission
    await performSubmit();
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col w-full items-stretch gap-4 h-full justify-between "
      >
        <div className="flex flex-col xl:flex-row xl:items-center flex-wrap w-full gap-4">
          <div className="flex-1">
            <InputField
              label="Admit Date"
              type="date"
              value={admitDate && isDateValid(admitDate) ? formatISODate(admitDate) : ''}
              required
              className="2xl:!h-11"
              onChange={(e) => handleChange('admitDate', e.target.value)}
              readOnly={isReadOnly}
            />
          </div>

          <div className="flex-1">
            <InputField
              label="Date of Service"
              type="date"
              value={
                dateOfService && isDateValid(dateOfService) ? formatISODate(dateOfService) : ''
              }
              required
              className="2xl:!h-11"
              onChange={(e) => handleChange('dateOfService', e.target.value)}
              readOnly={isReadOnly}
            />
          </div>

          <div className="flex-1">
            <label className="block text-xs 2xl:text-sm text-secondary !mb-2 text-secondary">
              Shared Visit
            </label>
            <Dropdown
              options={sharedVisitUsers
                .filter((u) => u.id !== undefined && u.id !== null)
                .map((u) => ({ label: u.name, value: u.id as number }))}
              value={selectedSharedVisit}
              onChange={(val: string | number | (string | number)[]) =>
                handleChange('sharedVisit', val as string)
              }
              placeholder="Select Shared Visit"
              className="w-full"
              variant="variant_1"
            />
          </div>
        </div>

        <VisitCodeComponent
          visitCodes={visitCodes}
          handleChange={handleChange}
          selectedVisitCodes={selectedVisitCodes}
          updateSelectedCode={updateSelectedCode}
        />
        <DiagnosisCode
          handleChange={handleChange}
          selectedDiagnosisCodes={selectedDiagnosisCodes}
          updateSelectedCode={updateSelectedCode}
        />

        {/* Shared Visit dropdown and Add to Charges checkbox aligned horizontally */}
        <div className="w-full flex flex-col sm:flex-row sm:justify-between  items-center gap-4">
          <div className="flex-1">
            <Checkbox
              id="addToCharges"
              checked={addToCharges}
              onChange={(checked) => handleChange('addToCharges', checked)}
              label="Add to Charges"
              className=""
              labelClassName="text-xs sm:text-sm"
              disabled={isReadOnly}
            />
          </div>
          <div className="flex-1">
            {!isReadOnly && (
              <Button
                variant="primary"
                loading={loading}
                size="large"
                className="w-full"
                loadingText={mode === 'view&edit' ? 'Updating...' : 'Saving...'}
                disabled={loading}
              >
                {mode === 'view&edit' ? 'Update' : 'Save'}
              </Button>
            )}
          </div>
        </div>
      </form>

      <ConfirmationModal
        open={showFutureAdmitError}
        onClose={() => setShowFutureAdmitError(false)}
        onConfirm={() => setShowFutureAdmitError(false)}
        title="Admit Date Error"
        message="Admit date cannot be in the future. Please review and update the date."
        confirmText="Close"
        cancelText="Back"
        icon={<WarningIcon />}
      />

      {/* Admit date confirmation modal */}
      <ConfirmationModal
        open={showServiceDateError}
        onClose={() => setShowServiceDateError(false)}
        onConfirm={() => setShowServiceDateError(false)}
        title="Invalid Date of Service"
        message="Date of Service cannot be before patient admit date. Please review and update the date."
        confirmText="OK"
        cancelText="Close"
        icon={<WarningIcon />}
      />

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
      />
    </>
  );
};

export default NoteForm;

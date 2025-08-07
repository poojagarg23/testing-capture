import React, { useEffect, useState, useRef } from 'react';
import PlusIcon from '../../assets/icons/charges-plus.svg?react';
import TrashIcon from '../../assets/icons/charges-delete.svg?react';
import SharedIcon from '../../assets/icons/charges-shared-visit.svg?react';
import SubmitIcon from '../../assets/icons/charges-submit.svg?react';
import ChargesAddPatient from '../reusable/ChargesAddPatient.tsx';
import ChargesSharedVisit from '../reusable/ChargesSharedVisits.tsx';
import Button from '../reusable/custom/Button.tsx';
import PageHeader from '../reusable/custom/PageHeader.tsx';
import ToggleButton from '../reusable/custom/ToggleButton.tsx';
import {
  fetchChargesPatientsList,
  deleteMultipleChargesPatients,
  deletePatientOrders,
  addPatientChargesHistory,
} from '../../helpers/Charges/charges-tab/index.js';
import { fetchVisitCodes, fetchSharedVisitUsers } from '../../helpers/index.js';
import ChargesVisitCodes from '../reusable/ChargesVisitCodes.tsx';
import { toast } from 'react-toastify';
import ChargesTable from './ChargesTable.jsx';
import { Patient } from '../../types/Patient.types.ts';
import { VisitCode, SharedVisit } from '../../types/index.ts';
import { formatISODate, isDateValid } from '../../helpers/dateUtils.ts';
import WarningIcon from '../../assets/icons/Warning.svg?react';
import ConfirmationModal from '../reusable/ConfirmationModal.tsx';
import { TOAST_CONFIG } from '../../constants/index.ts';
import InputField from '../reusable/custom/InputField.tsx';

const ChargesTab: React.FC = () => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [modalName, setModalName] = useState<string>('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatients, setSelectedPatients] = useState<Patient[]>([]);
  const [isAllSelected, setIsAllSelected] = useState<boolean>(false);
  const [date, setDate] = useState<string>(formatISODate(new Date()));
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [visitCodes, setVisitCodes] = useState<VisitCode[]>([]);
  const [sharedVisitUsers, setSharedVisitUsers] = useState<SharedVisit[]>([]);

  const [validationError, setValidationError] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const isInitialMount = useRef<boolean>(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchChargesPatients();
    } else {
      // This block will run on subsequent renders when patients changes
      // You can add any additional logic here if needed
    }
  }, [patients]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [visitCodesData, sharedVisitUsersData] = await Promise.all([
          fetchVisitCodes(),
          fetchSharedVisitUsers(),
        ]);
        setVisitCodes(visitCodesData);
        setSharedVisitUsers(sharedVisitUsersData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  const fetchChargesPatients = async (): Promise<void> => {
    try {
      const data = await fetchChargesPatientsList();
      setPatients(data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleModal = (name: string): void => {
    if ((name === 'visit codes' || name === 'shared visits') && selectedPatients.length === 0) {
      toast.error('Please select a patient', TOAST_CONFIG.ERROR);
      return;
    }
    setShowModal(!showModal);
    setModalName(name);
  };

  const deletePatients = async (): Promise<void> => {
    if (selectedPatients.length === 0) {
      toast.error('Please select at least one patient to delete', TOAST_CONFIG.ERROR);
      return;
    }
    try {
      await deleteMultipleChargesPatients(selectedPatients);
      const arrayofpaitentsid = selectedPatients.map((patient) => patient.patient_id);
      await deletePatientOrders(arrayofpaitentsid);
      await fetchChargesPatients();
      setSelectedPatients([]);
      if (isAllSelected) {
        setIsAllSelected(false);
      }
      toast.success('Patients deleted successfully', TOAST_CONFIG.SUCCESS);
    } catch (error) {
      console.error('Error deleting patients:', error);
    }
  };

  const reRenderPatients = async (message: string): Promise<void> => {
    toast.success(message, TOAST_CONFIG.SUCCESS);
    await fetchChargesPatients();
  };

  const submitCharges = async (): Promise<void> => {
    try {
      if (selectedPatients.length === 0) {
        toast.error('Please select at least one patient to submit charges', TOAST_CONFIG.ERROR);
        return;
      }
      if (date === '') {
        toast.error('Please select date of service before submitting charges', TOAST_CONFIG.ERROR);
        return;
      }

      const patientsWithInvalidDOS = selectedPatients.filter(
        (patient) => patient.admitdate && new Date(date) < new Date(patient.admitdate as string),
      );
      if (patientsWithInvalidDOS.length > 0) {
        setValidationError({
          title: 'Invalid Date of Service',
          message:
            'Date of Service cannot be before patient admit date for the selected patient(s).',
        });
        return;
      }

      const patientsWithoutVisitCodes = selectedPatients.filter(
        (patient) => !patient.visit_codes || patient.visit_codes.length === 0,
      );
      if (patientsWithoutVisitCodes.length > 0) {
        setValidationError({
          title: 'Visit Code Required',
          message: `${patientsWithoutVisitCodes.length} patient(s) don't have any visit codes assigned.`,
        });
        return;
      }

      const patientsWithoutPrimaryDiagnosis = selectedPatients.filter(
        (patient) =>
          !patient.diagnoses ||
          patient.diagnoses.length === 0 ||
          !patient.diagnoses.some((diag) => diag.is_primary),
      );
      if (patientsWithoutPrimaryDiagnosis.length > 0) {
        setValidationError({
          title: 'Primary Diagnosis Required',
          message: `${patientsWithoutPrimaryDiagnosis.length} patient(s) don't have a primary diagnosis assigned.`,
        });
        return;
      }

      // Prevent submission if any selected patient is inactive
      const hasInactivePatients = selectedPatients.some(
        (patient) => patient.status && patient.status.toLowerCase() === 'inactive',
      );
      if (hasInactivePatients) {
        setValidationError({
          title: 'Warning',
          message:
            "Charges cannot be submitted for inactive patients. Review the patient's status and update the record(s) if necessary.",
        });
        return;
      }

      let charges_ids: number[] = [];
      selectedPatients.forEach((patientData) => {
        patientData.visit_codes?.forEach((vc: VisitCode) => charges_ids.push(vc.id as number));
      });
      //remove duplicates from charges_ids integer array
      const removeDuplicates = <T,>(array: T[]): T[] => [...new Set(array)];
      charges_ids = removeDuplicates(charges_ids);

      setSubmitLoading(true);

      const responses = await addPatientChargesHistory(selectedPatients, date);
      const results = await Promise.all(responses.map((r) => r.json()));

      // Check if all requests were successful
      const allSuccessful = results.every((result) => result.success);

      setSubmitLoading(false);

      if (allSuccessful) {
        reRenderPatients('Charges Submitted Successfully');
      } else {
        // Some requests failed
        const failedCount = results.filter((result) => !result.success).length;
        toast.warning(`${failedCount} charge submissions failed`, TOAST_CONFIG.WARNING);
      }
    } catch (error) {
      setSubmitLoading(false);
      console.warn('Error submitting charges:', error);
      toast.error('Error submitting charges', TOAST_CONFIG.ERROR);
    }
  };

  return (
    <>
      {showModal && modalName === 'add patients' && (
        <ChargesAddPatient reRenderPatients={reRenderPatients} setShowModal={setShowModal} />
      )}
      {showModal && modalName === 'shared visits' && (
        <ChargesSharedVisit
          reRenderPatients={reRenderPatients}
          selectedPatients={selectedPatients}
          setShowModal={setShowModal}
        />
      )}
      {showModal && modalName === 'visit codes' && (
        <ChargesVisitCodes
          reRenderPatients={reRenderPatients}
          selectedPatients={selectedPatients}
          setShowModal={setShowModal}
        />
      )}

      {/* Validation Error Modal */}
      <ConfirmationModal
        open={validationError !== null}
        onClose={() => setValidationError(null)}
        onConfirm={() => setValidationError(null)}
        title={validationError?.title || 'Warning'}
        message={validationError?.message}
        confirmText="OK"
        cancelText="Close"
        icon={<WarningIcon />}
      />

      <div className="w-full h-full px-3 sm:px-2 py-1 sm:py-2 flex flex-col">
        {/* Fixed Header and Controls Section */}
        <div className="flex-shrink-0">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <PageHeader
              title="Charges"
              subtitle="Enter new billing items for the patient, including services, fees, and applicable dates."
              className="!mb-0"
            />
            <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-3">
              <div className="flex items-center gap-2">
                <ToggleButton
                  checked={isEditMode}
                  onChange={() => setIsEditMode(!isEditMode)}
                  title="Toggle Edit Mode"
                />
                <span className="text-sm font-gotham text-secondary">Edit Mode</span>
              </div>
            </div>
          </div>

          {/* Button Layout - Responsive */}
          <div className="mb-6">
            <div className="grid grid-cols-2 landscape-grid  gap-3 lg:grid-cols-[auto_auto_1fr_auto_auto] sm:gap-4 sm:items-center">
              <Button
                variant="dark"
                icon={PlusIcon}
                onClick={() => toggleModal('visit codes')}
                className="w-full sm:w-auto"
              >
                Visit Codes
              </Button>
              <Button
                variant="primary"
                icon={SharedIcon}
                onClick={() => toggleModal('shared visits')}
                className="w-full sm:w-auto"
              >
                Shared Visits
              </Button>
              {/* Empty spacer column for desktop */}
              <div className="hidden lg:block"></div>
              <Button
                variant="secondary"
                icon={PlusIcon}
                onClick={() => toggleModal('add patients')}
                className="w-full sm:w-auto"
              >
                Add Patients
              </Button>
              <Button
                variant="tertiary"
                icon={TrashIcon}
                onClick={() => deletePatients()}
                className="w-full sm:w-auto"
              >
                Delete Patient
              </Button>
            </div>
          </div>
        </div>

        {/* Scrollable Table Section */}
        <div className="flex-1 min-h-0 overflow-hidden mb-6">
          <ChargesTable
            isAllSelected={isAllSelected}
            setIsAllSelected={setIsAllSelected}
            setSelectedPatients={setSelectedPatients}
            patients={patients}
            selectedPatients={selectedPatients}
            isEditMode={isEditMode}
            visitCodes={visitCodes}
            sharedVisitUsers={sharedVisitUsers}
            setPatients={setPatients}
          />
        </div>

        {/* Fixed Bottom Section - Date input and Submit button */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          {/* Left: Date Section */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <label className="text-sm font-medium text-secondary whitespace-nowrap font-gotham">
              <span className="text-error mr-1">*</span>Date Of Service
            </label>
            <InputField
              required
              type="date"
              placeholder="mm-dd-yyyy"
              value={date && isDateValid(date) ? formatISODate(date) : ''}
              onChange={(e) => setDate(e.target.value)}
              className="sm:w-48"
              labelClassName="text-sm font-medium text-secondary whitespace-nowrap font-gotham"
            />
          </div>

          {/* Right: Submit Button */}
          <div className="w-full sm:w-auto">
            <Button
              variant="primary"
              disabled={submitLoading}
              loading={submitLoading}
              loadingText="Submitting..."
              icon={SubmitIcon}
              onClick={() => submitCharges()}
              className="w-full sm:w-auto"
            >
              Submit Charges
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChargesTab;

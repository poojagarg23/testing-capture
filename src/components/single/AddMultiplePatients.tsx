import React, { useState, useEffect, useCallback } from 'react';
import PatientDetails from './PatientDetails.tsx';
import PatientDetailsLeftArrow from '../../assets/icons/PatientDetailsLeftArrow.svg?react';
import PatientDetailsRightArrow from '../../assets/icons/PatientDetailsRightArrow.svg?react';
import { toast } from 'react-toastify';
import {
  addPatient,
  addPatientIdToChargesPage,
  saveDiagnosis,
  formatProviderName,
  fetchHospitals,
  fetchAuthorizedProviders,
} from '../../helpers/index.js';
import { capitalizeNames } from '../../helpers/index.js';
import {
  isOlderThanNDays,
  formatDisplayDate,
  isDateValid,
  formatISODate,
  calculateAge,
} from '../../helpers/dateUtils.ts';
import Button from '../reusable/custom/Button';
import Checkbox from '../reusable/custom/Checkbox';
import Table, { TableColumn } from '../reusable/custom/Table';
import EditableField from '../reusable/custom/EditableField';
import EditableSelect from '../reusable/custom/EditableSelect';
import EditableNameField from '../reusable/custom/EditableNameField';
import ToggleButton from '../reusable/custom/ToggleButton';
import type { AddMultiplePatientsProps, Patient } from '../../types/Patient.types';
import type { Diagnosis, Hospital, Provider } from '../../types';
import { TOAST_CONFIG } from '../../constants/index.ts';
import ConfirmationModal from '../reusable/ConfirmationModal.tsx';

const AddMultiplePatients: React.FC<AddMultiplePatientsProps> = ({
  patients: initialPatients,
  onClose,
  onRefetch,
}) => {
  // Maintain editable local copy of patients
  const [patients, setPatients] = useState<Patient[]>(initialPatients);

  const [patientIndex, setPatientIndex] = useState<number>(0);
  const [addPatientToChargesPage, setAddPatientToChargesPage] = useState<boolean>(true);
  const isSummaryPage = patientIndex === patients.length;
  const [loading, setLoading] = useState<boolean>(false);
  const [showAdmitWarning, setShowAdmitWarning] = useState<boolean>(false);
  const [showFutureAdmitError, setShowFutureAdmitError] = useState<boolean>(false);
  // DOB confirmation modal and dynamic message
  const [showDobWarning, setShowDobWarning] = useState<boolean>(false);
  const [dobWarningMessage, setDobWarningMessage] = useState<string>('');
  // Duplicate patient queue modal
  const [showCreateAdmissionModal, setShowCreateAdmissionModal] = useState<boolean>(false);
  const [duplicateQueue, setDuplicateQueue] = useState<{ patient: Patient; message: string }[]>([]);
  const currentDuplicate = duplicateQueue[0] || null;

  // Age thresholds – keep these centralized for easy future adjustments
  const AGE_MIN_WARNING = 18;
  const AGE_MAX_WARNING = 130;

  // Edit mode toggle
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Fetch dropdown data
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [authorizedProviders, setAuthorizedProviders] = useState<Provider[]>([]);

  // If user is navigating, store the next index until confirmation
  const [pendingPatientIndex, setPendingPatientIndex] = useState<number | null>(null);

  const removePatientAndUpdateIndex = useCallback(
    (patientToRemove: Patient) => {
      setPatients((prevPatients) => {
        const filteredPatients = prevPatients.filter(
          (p) =>
            !(
              p.firstname === patientToRemove.firstname &&
              p.lastname === patientToRemove.lastname &&
              p.dateofbirth === patientToRemove.dateofbirth
            ),
        );

        if (patientIndex >= filteredPatients.length) {
          if (patientIndex === prevPatients.length) {
            setPatientIndex(filteredPatients.length);
          } else {
            setPatientIndex(Math.max(0, filteredPatients.length - 1));
          }
        } else if (
          patientIndex === prevPatients.length &&
          filteredPatients.length < prevPatients.length
        ) {
          setPatientIndex(filteredPatients.length);
        }

        return filteredPatients;
      });
    },
    [patientIndex],
  );

  const processDuplicateQueue = useCallback(() => {
    setDuplicateQueue((q) => {
      const [, ...rest] = q;
      if (rest.length === 0) {
        setShowCreateAdmissionModal(false);
        onRefetch?.();
        onClose?.();
      }
      return rest;
    });
  }, [onRefetch, onClose]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hospitalsData, providersData] = await Promise.all([
          fetchHospitals(),
          fetchAuthorizedProviders(),
        ]);
        setHospitals(hospitalsData);
        setAuthorizedProviders(providersData);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    return () => {
      setShowCreateAdmissionModal(false);
      setDuplicateQueue([]);
      setLoading(false);
      setShowAdmitWarning(false);
      setShowFutureAdmitError(false);
      setShowDobWarning(false);
      setPendingPatientIndex(null);
    };
  }, []);

  // Helper to update a patient field and trigger re-render
  const updatePatientField = useCallback(
    (id: string, field: string, value: string) => {
      setPatients(
        (prev) =>
          prev.map((p) => {
            if (String(p.id) !== id) return p;

            const updated: Patient = { ...p } as Patient;

            if (field === 'hospital_id') {
              const selectedHospital = hospitals.find((h) => h.id === Number(value));
              if (selectedHospital) {
                updated.hospital = selectedHospital;
                updated.hospital_id = selectedHospital.id;
              }
            } else if (field === 'provider') {
              const selectedProvider = authorizedProviders.find(
                (prov) => prov.id === Number(value),
              );
              if (selectedProvider) {
                updated.provider = selectedProvider;
              }
            } else if (field === 'visittype') {
              updated.visittype = value;
            } else if (field === 'dateofbirth') {
              updated.dateofbirth = value;
            } else if (field === 'admitdate') {
              updated.admitdate = value;
            } else {
              // Other fields including sanitized name fields
              (updated as unknown as Record<string, string | null>)[field] = value;
            }
            return updated;
          }) as Patient[],
      );
    },
    [hospitals, authorizedProviders],
  );

  // Dummy onSave (could be expanded to persist changes immediately)
  const handleSaveInline = (_id?: string, _directChange?: { field: string; value: string }) => {
    /* currently does nothing */
  };

  // Editable options for dropdowns
  const hospitalOptions = hospitals.map((h) => ({
    label: h.abbreviation || h.hospital,
    value: h.id,
  }));

  const providerOptions = authorizedProviders.map((prov) => ({
    label: formatProviderName(prov),
    value: prov.id,
  }));

  const visitTypeOptions = [
    { label: 'Inpatient', value: 'inpatient' },
    { label: 'Consult', value: 'consult' },
  ];

  // Define table columns for the editable summary page
  const tableColumns: TableColumn<Patient>[] = [
    {
      key: 'name',
      label: 'Patient Name',
      noTruncate: true,
      render: (patient) => (
        <EditableNameField
          id={patient.id.toString()}
          firstName={patient.firstname}
          middleName={patient.middlename || ''}
          lastName={patient.lastname}
          displayValue={capitalizeNames(patient.firstname, patient.lastname)}
          isEditMode={isEditMode}
          onUpdate={updatePatientField}
          onSave={handleSaveInline}
        />
      ),
      priority: 'high',
    },
    {
      key: 'dateofbirth',
      label: 'DOB',
      render: (patient) => {
        const displayValue =
          patient.dateofbirth && isDateValid(patient.dateofbirth)
            ? isEditMode
              ? isDateValid(patient.dateofbirth)
                ? formatISODate(patient.dateofbirth)
                : ''
              : formatDisplayDate(patient.dateofbirth)
            : '';
        return (
          <EditableField
            id={patient.id.toString()}
            field="dateofbirth"
            value={displayValue}
            type="date"
            placeholder="mm/dd/yyyy"
            isEditMode={isEditMode}
            onUpdate={updatePatientField}
            onSave={handleSaveInline}
          />
        );
      },
      priority: 'high',
    },
    {
      key: 'admitdate',
      label: 'Admit Date',
      render: (patient) => {
        const displayValue =
          patient.admitdate && isDateValid(patient.admitdate)
            ? isEditMode
              ? isDateValid(patient.admitdate)
                ? formatISODate(patient.admitdate)
                : ''
              : formatDisplayDate(patient.admitdate)
            : '';
        return (
          <EditableField
            id={patient.id.toString()}
            field="admitdate"
            value={displayValue}
            type="date"
            isEditMode={isEditMode}
            onUpdate={updatePatientField}
            onSave={handleSaveInline}
          />
        );
      },
      priority: 'high',
    },
    {
      key: 'hospital',
      label: 'Facility Name',
      render: (patient) => (
        <EditableSelect
          id={patient.id.toString()}
          field="hospital_id"
          value={patient.hospital?.id || ''}
          options={hospitalOptions}
          isEditMode={isEditMode}
          onUpdate={updatePatientField}
          onSave={handleSaveInline}
        />
      ),
      priority: 'high',
    },
    {
      key: 'provider',
      label: 'Provider',
      render: (patient) => (
        <EditableSelect
          id={patient.id.toString()}
          field="provider"
          value={patient.provider?.id || ''}
          options={providerOptions}
          isEditMode={isEditMode}
          onUpdate={updatePatientField}
          onSave={handleSaveInline}
        />
      ),
      priority: 'high',
    },
    {
      key: 'visittype',
      label: 'Visit Type',
      render: (patient) => (
        <EditableSelect
          id={patient.id.toString()}
          field="visittype"
          value={patient.visittype}
          options={visitTypeOptions}
          isEditMode={isEditMode}
          onUpdate={updatePatientField}
          onSave={handleSaveInline}
        />
      ),
      priority: 'high',
    },
  ];

  const changePatientIndex = (type: 'left' | 'right'): void => {
    if (type === 'left') {
      if (patientIndex > 0) {
        setPatientIndex(patientIndex - 1);
      }
    } else {
      if (patientIndex < patients.length) {
        const currentPatient = patients[patientIndex];
        if (validateCurrentPatient(currentPatient)) {
          const targetIndex = patientIndex + 1;

          // Check DOB & admit warnings for current patient before navigating
          const dobIssues = (() => {
            if (!currentPatient.dateofbirth) return false;
            const dobDate = new Date(currentPatient.dateofbirth);
            const today = new Date();

            today.setHours(0, 0, 0, 0);
            dobDate.setHours(0, 0, 0, 0);
            if (dobDate >= today) return true;
            const ageVal = calculateAge(currentPatient.dateofbirth);
            return ageVal !== null && (ageVal < AGE_MIN_WARNING || ageVal > AGE_MAX_WARNING);
          })();

          if (dobIssues) {
            // Build message specific to this patient
            const parts: string[] = [];
            if (currentPatient.dateofbirth) {
              const dobDate = new Date(currentPatient.dateofbirth);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              dobDate.setHours(0, 0, 0, 0);
              if (dobDate >= today) parts.push('a DOB that is today or in the future');
              else {
                const ageVal = calculateAge(currentPatient.dateofbirth);
                if (ageVal !== null && ageVal < AGE_MIN_WARNING)
                  parts.push(`age under ${AGE_MIN_WARNING}`);
                if (ageVal !== null && ageVal > AGE_MAX_WARNING)
                  parts.push(`age over ${AGE_MAX_WARNING}`);
              }
            }
            const patientName = `${currentPatient.firstname} ${currentPatient.lastname}`.trim();
            setDobWarningMessage(
              `Patient ${patientName || '#'} has ${parts.join(' and ')}. If this is correct, click Confirm. Otherwise, please review and update the date.`,
            );
            setPendingPatientIndex(targetIndex);
            setShowDobWarning(true);
            return;
          }

          // No admission-date confirmation for arrow navigation

          setPatientIndex(targetIndex);
        }
      }
    }
  };

  const validateCurrentPatient = (patient: Patient): boolean => {
    // Skip immediate DOB warnings – handled via confirmation modal

    if (!patient.firstname) {
      toast.error('Please enter first name', TOAST_CONFIG.ERROR);
      return false;
    }
    if (!patient.lastname) {
      toast.error('Please enter last name', TOAST_CONFIG.ERROR);
      return false;
    }
    if (!patient.dateofbirth) {
      toast.error('Please select date of birth', TOAST_CONFIG.ERROR);
      return false;
    }
    if (!patient.visittype) {
      toast.error('Please select visit type', TOAST_CONFIG.ERROR);
      return false;
    }
    if (!patient.admitdate) {
      toast.error('Please select admit date', TOAST_CONFIG.ERROR);
      return false;
    }
    if (patient.admitdate) {
      const admit = new Date(patient.admitdate as string);
      const today = new Date();
      admit.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (admit > today) {
        setShowFutureAdmitError(true);
        return false;
      }
    }
    const hasHospital = patient.hospital?.id;
    if (!hasHospital) {
      toast.error('Please select place of service', TOAST_CONFIG.ERROR);
      return false;
    }
    if (!patient.provider) {
      toast.error('Please select provider', TOAST_CONFIG.ERROR);
      return false;
    }
    return true;
  };

  const saveAllPatients = async (): Promise<void> => {
    setLoading(true);
    try {
      // Ensure required name fields are present
      for (const p of patients) {
        if (!p.firstname?.trim()) {
          toast.error('Please enter first name', TOAST_CONFIG.ERROR);
          return;
        }
        if (!p.lastname?.trim()) {
          toast.error('Please enter last name', TOAST_CONFIG.ERROR);
          return;
        }
      }

      // Add duplicate check
      for (let i = 0; i < patients.length; i++) {
        for (let j = i + 1; j < patients.length; j++) {
          if (
            patients[i].firstname === patients[j].firstname &&
            patients[i].lastname === patients[j].lastname &&
            patients[i].dateofbirth === patients[j].dateofbirth
          ) {
            toast.error(
              'The same facesheet has been detected in this batch. Please try uploading again. Only upload unique facesheets.',
              TOAST_CONFIG.ERROR,
            );
            return;
          }
        }
      }

      const savePatientsPromiseArray = patients
        .map((p) => {
          const hospital = p.hospital;
          if (!hospital) {
            toast.error(
              `Hospital not found for patient ${p.firstname} ${p.lastname}`,
              TOAST_CONFIG.ERROR,
            );
            return null;
          }
          const provider = p.provider;
          if (!provider) {
            toast.error(
              `Provider not found for patient ${p.firstname} ${p.lastname}`,
              TOAST_CONFIG.ERROR,
            );
            return null;
          }
          return addPatient(
            p.id,
            p.firstname as string,
            p.lastname as string,
            p.middlename,
            p.gender,
            p.dateofbirth,
            p.room || null,
            hospital,
            p.admitdate,
            p.dischargedate || null,
            p.visittype as string,
            p.status || null,
            p.facesheetalias || null,
            provider,
          );
        })
        .filter(Boolean);
      const filteredResults = savePatientsPromiseArray.filter(Boolean) as Promise<Response>[];
      const result = await Promise.all(filteredResults);
      const patientResponses = await Promise.all(result.map((r) => r.json()));

      // Collect duplicates that need admission creation
      const duplicates = patientResponses
        .map((resp, idx) =>
          resp.prompt
            ? {
                patient: patients[idx],
                message:
                  resp.message ||
                  `A patient with the name ${patients[idx].firstname}, ${patients[idx].lastname} and DOB ${patients[idx].dateofbirth} already exists in your records. Would you like to create a new admission instead?`,
              }
            : null,
        )
        .filter(Boolean) as { patient: Patient; message: string }[];

      // Remove successfully added patients from the local state
      const successfullyAddedIndices = patientResponses
        .map((resp, idx) => (resp.success && !resp.prompt ? idx : -1))
        .filter((idx) => idx !== -1);

      if (successfullyAddedIndices.length > 0) {
        // Show success messages for added patients
        successfullyAddedIndices.forEach((idx) => {
          const patientName = `${patients[idx].firstname} ${patients[idx].lastname}`;
          toast.success(`${patientName} Added!`, TOAST_CONFIG.SUCCESS);
        });

        // Handle diagnoses for successful patients
        const diagnosesPromiseArray = successfullyAddedIndices.map((idx) => {
          const response = patientResponses[idx];
          return saveDiagnosis(response.id, patients[idx].selectedDiagnosis || []);
        });

        if (diagnosesPromiseArray.length > 0) {
          await Promise.all(diagnosesPromiseArray);
          toast.success('Diagnoses Saved Successfully!', TOAST_CONFIG.SUCCESS);
        }

        // Add successful patients to charges page if enabled
        if (addPatientToChargesPage) {
          const addPatientToChargesPagePromiseArray = successfullyAddedIndices.map((idx) => {
            const response = patientResponses[idx];
            return addPatientIdToChargesPage(response.id);
          });
          await Promise.all(addPatientToChargesPagePromiseArray);
          toast.success('Patients added to Charges Page', TOAST_CONFIG.SUCCESS);
        }

        // Remove successful patients from local state and adjust patient index
        setPatients((prevPatients) => {
          const remainingPatients = prevPatients.filter(
            (_, idx) => !successfullyAddedIndices.includes(idx),
          );
          return remainingPatients;
        });

        // Adjust patient index if needed
        setPatientIndex((prevIndex) => {
          const removedBeforeCurrent = successfullyAddedIndices.filter(
            (idx) => idx < prevIndex,
          ).length;
          const newIndex = prevIndex - removedBeforeCurrent;
          const newPatientCount = patients.length - successfullyAddedIndices.length;

          // If current index is beyond the new patient count, go to summary page
          if (newIndex >= newPatientCount) {
            return newPatientCount;
          }

          return Math.max(0, newIndex);
        });
      }

      if (duplicates.length > 0) {
        setDuplicateQueue(duplicates);
        setShowCreateAdmissionModal(true);
        setLoading(false);
        return;
      }

      // Show error messages for failed patients (excluding duplicates which are handled separately)
      const failedPatients = patientResponses
        .map((resp, idx) => (!resp.success && !resp.prompt ? { response: resp, index: idx } : null))
        .filter(Boolean) as { response: { error?: string }; index: number }[];

      if (failedPatients.length > 0) {
        failedPatients.forEach(({ response: failedPatient, index }) => {
          const patientName = `${patients[index].firstname} ${patients[index].lastname}`;
          toast.error(
            `Failed to add patient ${patientName}: ${failedPatient.error || 'Unknown error'}`,
            TOAST_CONFIG.ERROR,
          );
        });
      }

      // If no duplicates and we processed all patients, close modal and refetch data
      if (duplicates.length === 0) {
        onClose?.();
        onRefetch?.();
      }
    } catch (error: unknown) {
      console.error('Error saving patients:', error);
      toast.error('An error occurred', TOAST_CONFIG.ERROR);
    } finally {
      setLoading(false);
    }
  };

  // Wrapper to check DOB & admit date conditions before saving
  const handleSaveAllPatients = () => {
    // Gather DOB issues per patient to build dynamic message
    const dobIssues = patients.reduce<{ future: number; under: number; over: number }>(
      (acc, p) => {
        if (!p.dateofbirth) return acc;
        const dobDate = new Date(p.dateofbirth);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dobDate.setHours(0, 0, 0, 0);
        if (dobDate >= today) {
          acc.future += 1;
        } else {
          const ageVal = calculateAge(p.dateofbirth);
          if (ageVal !== null) {
            if (ageVal < AGE_MIN_WARNING) acc.under += 1;
            if (ageVal > AGE_MAX_WARNING) acc.over += 1;
          }
        }
        return acc;
      },
      { future: 0, under: 0, over: 0 },
    );

    if (dobIssues.future) {
      toast.error(
        `One or more patients have a DOB that is today or in the future. Please review and update the dates before saving.`,
        TOAST_CONFIG.ERROR,
      );
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const hasFutureAdmit = patients.some((p) => {
      if (!p.admitdate || !isDateValid(p.admitdate)) return false;
      const admit = new Date(p.admitdate);
      admit.setHours(0, 0, 0, 0);
      return admit > today;
    });
    if (hasFutureAdmit) {
      setShowFutureAdmitError(true);
      return;
    }

    const hasDobIssue = dobIssues.under || dobIssues.over;

    if (hasDobIssue) {
      // Build user-friendly message
      const parts: string[] = [];
      if (dobIssues.under)
        parts.push(
          `${dobIssues.under} patient${dobIssues.under > 1 ? 's' : ''} under ${AGE_MIN_WARNING}`,
        );
      if (dobIssues.over)
        parts.push(
          `${dobIssues.over} patient${dobIssues.over > 1 ? 's' : ''} over ${AGE_MAX_WARNING}`,
        );

      setDobWarningMessage(
        `Warning: ${parts.join(', ')}. If this is correct, click Confirm. Otherwise, please review and update the dates.`,
      );
      setShowDobWarning(true);
      return;
    }

    const hasOldAdmission = patients.some((p) => isOlderThanNDays(p.admitdate, 90));
    if (hasOldAdmission) {
      setShowAdmitWarning(true);
      return;
    }

    saveAllPatients();
  };

  // Confirm handler for duplicate patient admission creation
  const handleCreateAdmissionConfirm = async () => {
    if (!currentDuplicate) return;
    try {
      setLoading(true);
      const { patient: dupP } = currentDuplicate;
      const hospital = dupP.hospital as Hospital;
      const provider = dupP.provider as Provider;

      if (!hospital || !provider) {
        setLoading(false);
        removePatientAndUpdateIndex(currentDuplicate.patient);
        processDuplicateQueue();
        return;
      }

      const response = await addPatient(
        dupP.id,
        dupP.firstname as string,
        dupP.lastname as string,
        dupP.middlename,
        dupP.gender,
        dupP.dateofbirth,
        dupP.room || null,
        hospital,
        dupP.admitdate,
        dupP.dischargedate || null,
        dupP.visittype as string,
        dupP.status || null,
        dupP.facesheetalias || null,
        provider,
        true,
      );

      const json = await response.json();
      if (json.success === true) {
        toast.success(json.message || 'New admission created successfully', TOAST_CONFIG.SUCCESS);

        if (dupP.selectedDiagnosis && dupP.selectedDiagnosis.length > 0) {
          await saveDiagnosis(json.id, dupP.selectedDiagnosis);
          toast.success('Diagnoses Saved Successfully!', TOAST_CONFIG.SUCCESS);
        }

        // Add patient to charges page if enabled
        if (addPatientToChargesPage) {
          await addPatientIdToChargesPage(json.id);
          toast.success('Patient added to Charges Page', TOAST_CONFIG.SUCCESS);
        }

        removePatientAndUpdateIndex(currentDuplicate.patient);
        processDuplicateQueue();
      } else {
        toast.error(json.message || 'Failed to create admission', TOAST_CONFIG.ERROR);
        removePatientAndUpdateIndex(currentDuplicate.patient);
        processDuplicateQueue();
      }
    } catch (error) {
      console.error('Error creating admission:', error);
      toast.error('An error occurred while creating admission', TOAST_CONFIG.ERROR);
      removePatientAndUpdateIndex(currentDuplicate.patient);
      processDuplicateQueue();
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full">
      {/* Navigation Header */}
      <div className="flex items-center justify-center mb-8">
        {/* Title and Page Counter */}
        <div className="flex items-center gap-5">
          <button
            onClick={() => changePatientIndex('left')}
            disabled={patientIndex === 0}
            className="flex items-center gap-2 disabled:opacity-30 cursor-pointer hover:opacity-80 transition-all duration-200 p-2 group"
          >
            <PatientDetailsLeftArrow
              fill={patientIndex === 0 ? '#9ca3af' : '#24a5df'}
              className="w-8 h-8 group-hover:scale-110 transition-transform duration-200"
            />
          </button>
          <div className="font-gotham-medium text-sm text-secondary opacity-80">
            {isSummaryPage
              ? `${patients.length + 1} / ${patients.length + 1}`
              : `${patientIndex + 1} / ${patients.length + 1}`}
          </div>
          <button
            onClick={() => changePatientIndex('right')}
            disabled={patientIndex === patients.length}
            className="flex cursor-pointer items-center gap-2 disabled:opacity-30 hover:opacity-80 transition-all duration-200 p-2 group"
          >
            <PatientDetailsRightArrow
              fill={patientIndex === patients.length ? '#9ca3af' : '#24a5df'}
              className="w-8 h-8 group-hover:scale-110 transition-transform duration-200"
            />
          </button>
        </div>
      </div>

      {/* Content */}
      {isSummaryPage ? (
        <div className="flex flex-col h-full min-h-[600px]">
          {/* Header with edit toggle */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-gotham-bold text-xl text-secondary">Summary</h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-secondary">Edit Mode</span>
              <ToggleButton checked={isEditMode} onChange={() => setIsEditMode(!isEditMode)} />
            </div>
          </div>

          {/* Scrollable content area - CRITICAL for proper height constraint */}
          <div className="flex-1 min-h-0 overflow-hidden mb-6">
            <Table
              columns={tableColumns}
              data={patients}
              activeRecordsCount={patients.length}
              activeRecordsText="Patients to Add"
            />
          </div>

          {/* Fixed footer */}
          <div className="flex-shrink-0 space-y-6">
            {/* Checkbox */}
            <Checkbox
              id="addToCharges"
              checked={addPatientToChargesPage}
              onChange={setAddPatientToChargesPage}
              label="Add all patients to charges page"
            />

            {/* Save Button aligned bottom-right */}
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={handleSaveAllPatients}
                disabled={loading}
                loading={loading}
                loadingText="Saving..."
                className="px-6 py-3 text-xs font-gotham-bold"
              >
                Save All
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <PatientDetails
          key={patientIndex}
          patient={patients[patientIndex]}
          mode={'add'}
          subMode={'addMultiplePatients'}
          selectedDiagnosisProps={patients[patientIndex]?.selectedDiagnosis as Diagnosis[]}
        />
      )}

      <ConfirmationModal
        open={showFutureAdmitError}
        onClose={() => setShowFutureAdmitError(false)}
        onConfirm={() => setShowFutureAdmitError(false)}
        title="Admit Date Error"
        message="Admit date cannot be in the future. Please review and update the date."
        confirmText="Close"
        cancelText="Back"
      />

      {/* Admission date >90 days confirmation modal */}
      <ConfirmationModal
        open={showAdmitWarning}
        onClose={() => setShowAdmitWarning(false)}
        onConfirm={() => {
          setShowAdmitWarning(false);
          if (pendingPatientIndex !== null) {
            setPatientIndex(pendingPatientIndex);
            setPendingPatientIndex(null);
          } else {
            saveAllPatients();
          }
        }}
        title="Warning"
        message="Warning: One or more patients have an admission date over 90 days old. If this is correct, click Confirm. Otherwise, please review and update the dates."
        confirmText="Confirm"
        cancelText="Back"
      />

      {/* DOB confirmation modal */}
      <ConfirmationModal
        open={showDobWarning}
        onClose={() => setShowDobWarning(false)}
        onConfirm={() => {
          setShowDobWarning(false);
          if (pendingPatientIndex !== null) {
            // Navigate after confirmation
            setPatientIndex(pendingPatientIndex);
            setPendingPatientIndex(null);
            // If navigation, no further save action needed now
          } else {
            // After confirming DOB issue for Save All flow
            const hasOldAdmission = patients.some((p) => isOlderThanNDays(p.admitdate, 90));
            if (hasOldAdmission) {
              setShowAdmitWarning(true);
            } else {
              saveAllPatients();
            }
          }
        }}
        title="DOB Warning"
        message={dobWarningMessage}
        confirmText="Confirm"
        cancelText="Back"
      />

      <ConfirmationModal
        open={showCreateAdmissionModal}
        onClose={() => {
          setDuplicateQueue((q) => {
            const [, ...rest] = q;
            setShowCreateAdmissionModal(false);
            return rest;
          });

          setLoading(false);
        }}
        onConfirm={handleCreateAdmissionConfirm}
        title="Existing Patient Found"
        message={currentDuplicate?.message ?? ''}
        confirmText={loading ? 'Creating...' : 'Create Admission'}
        cancelText="Cancel"
        hideCancelButton={loading}
      />
    </div>
  );
};

export default AddMultiplePatients;

import React, { useState, useRef } from 'react';
import Admissions, { AdmissionsHandle } from './Admissions';
import PatientDetails, { PatientDetailsHandle } from './PatientDetails';
import PatientChargesHistory from './PatientChargesHistory';
import Notes, { NotesHandle } from './Notes.tsx';
import type { Patient } from '../../types/Patient.types';
import AuditLog from './AuditLog.tsx';
import type { AddSinglePatientProps } from '../../types/AddSinglePatient.types';
import type { Mode, SubMode } from '../../types';

import ConfirmationModal from '../reusable/ConfirmationModal.tsx';

const AddSinglePatient: React.FC<AddSinglePatientProps> = ({ location, subMode }) => {
  const typedSubMode: SubMode = subMode;
  // Always default mode to 'add' if not provided
  const mode: Mode = location?.state?.mode ?? 'add';
  const patientData = location?.state?.patient;
  const [activeTab, setActiveTab] = useState<string>(
    location?.state?.activeTab ?? (mode === 'add' ? 'Facesheet' : 'Details'),
  );
  const [autoFillChoice, setAutoFillChoice] = useState<boolean | null>(
    location?.state?.autoFillChoice ?? null,
  );
  // Patient can be undefined/null at first, so we use Patient | undefined
  const [patient] = useState<Patient | undefined>(
    patientData && Object.keys(patientData).length > 0 ? patientData : undefined,
  );
  // Track unsaved changes warning modal
  const [showUnsavedModal, setShowUnsavedModal] = useState<boolean>(false);
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  // Ref to access methods from PatientDetails component
  const patientDetailsRef = useRef<PatientDetailsHandle>(null);
  const admissionsRef = useRef<AdmissionsHandle>(null);
  const notesRef = useRef<NotesHandle>(null);

  const handleTabChange = (tab: string) => {
    if (mode !== 'view&edit') {
      return;
    }

    // Determine current tab handle for unsaved state
    let currentHandle: { hasUnsavedChanges?: () => boolean } | null = null;
    if (activeTab === 'Details') currentHandle = patientDetailsRef.current;
    if (activeTab === 'Admissions') currentHandle = admissionsRef.current;
    if (activeTab === 'Notes') currentHandle = notesRef.current;

    const hasUnsaved = currentHandle?.hasUnsavedChanges?.();

    if (hasUnsaved) {
      setPendingTab(tab);
      setShowUnsavedModal(true);
      return;
    }

    setAutoFillChoice(autoFillChoice);
    setActiveTab(tab);
  };

  const confirmLeaveTab = () => {
    setShowUnsavedModal(false);
    if (pendingTab) {
      // Determine active handle and discard changes
      let activeHandle: { discardChanges?: () => void } | null = null;
      if (activeTab === 'Details') activeHandle = patientDetailsRef.current;
      if (activeTab === 'Admissions') activeHandle = admissionsRef.current;
      if (activeTab === 'Notes') activeHandle = notesRef.current;

      activeHandle?.discardChanges?.();

      setActiveTab(pendingTab);
      setPendingTab(null);
    }
  };

  const cancelLeaveTab = () => {
    setShowUnsavedModal(false);
    setPendingTab(null);
  };

  // Only render patient-dependent tabs if patient is defined
  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}

      <div className="flex border-b border-subtle mb-4 overflow-x-auto whitespace-nowrap scrollbar-[3px]">
        <button
          onClick={() => handleTabChange('Details')}
          className={`tab-btn-base ${
            activeTab === 'Details' ? 'tab-btn-active' : 'tab-btn-inactive'
          }`}
        >
          Details
        </button>

        {mode === 'view&edit' && (
          <button
            onClick={() => handleTabChange('Admissions')}
            className={`tab-btn-base ${
              activeTab === 'Admissions' ? 'tab-btn-active' : 'tab-btn-inactive'
            }`}
          >
            Admissions
          </button>
        )}

        {mode === 'add' && (
          <button
            onClick={() => handleTabChange('Facesheet')}
            className={`tab-btn-base ${
              activeTab === 'Facesheet' ? 'tab-btn-active' : 'tab-btn-inactive'
            }`}
          >
            Face Sheet
          </button>
        )}

        {mode === 'view&edit' && (
          <button
            onClick={() => handleTabChange('Notes')}
            className={`tab-btn-base ${
              activeTab === 'Notes' ? 'tab-btn-active' : 'tab-btn-inactive'
            }`}
          >
            Notes
          </button>
        )}

        {mode === 'view&edit' && (
          <button
            onClick={() => handleTabChange('ChargesHistory')}
            className={`tab-btn-base ${
              activeTab === 'ChargesHistory' ? 'tab-btn-active' : 'tab-btn-inactive'
            }`}
          >
            Charges History
          </button>
        )}
        {mode === 'view&edit' && (
          <button
            onClick={() => handleTabChange('AuditLog')}
            className={`tab-btn-base ${
              activeTab === 'AuditLog' ? 'tab-btn-active' : 'tab-btn-inactive'
            }`}
          >
            Audit Log
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-auto">
        {activeTab === 'Admissions' && patient && (
          <Admissions ref={admissionsRef} subMode={typedSubMode} patient={patient} />
        )}
        {activeTab === 'Details' && mode === 'view&edit' && patient && (
          <PatientDetails
            ref={patientDetailsRef}
            subMode={typedSubMode}
            mode={mode}
            patient={patient}
            autoFillChoice={autoFillChoice ?? undefined}
          />
        )}
        {activeTab === 'Notes' && patient && (
          <Notes ref={notesRef} subMode={typedSubMode} patient={patient} />
        )}
        {activeTab === 'ChargesHistory' && patient && <PatientChargesHistory patient={patient} />}
        {activeTab === 'AuditLog' && patient && <AuditLog patient={patient} />}
        {activeTab === 'Facesheet' && patient && (
          <PatientDetails
            ref={patientDetailsRef}
            subMode={typedSubMode}
            mode={mode}
            patient={patient}
            autoFillChoice={autoFillChoice ?? undefined}
          />
        )}
      </div>

      {/* Unsaved changes confirmation modal */}
      <ConfirmationModal
        open={showUnsavedModal}
        onClose={cancelLeaveTab}
        onConfirm={confirmLeaveTab}
        title="Leave without saving?"
        message="You have unsaved changes. Are you sure you want to leave without saving?"
        confirmText="Leave"
        cancelText="Stay"
      />
    </div>
  );
};

export default AddSinglePatient;

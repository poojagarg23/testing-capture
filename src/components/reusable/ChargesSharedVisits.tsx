import React, { useEffect, useState } from 'react';
import { fetchSharedVisitUsers, attachSharedVisitsToAdmission } from '../../helpers/index.ts';
import { toast } from 'react-toastify';
import { AttachSharedVisitPayload, SharedVisit } from '../../types/index.ts';
import { ChargesSharedVisitProps } from '../../types/ChargesSharedVisit.type.ts';
import CustomModal from './CustomModal.tsx';
import Button from './custom/Button.tsx';
import TrashIcon from '../../assets/icons/Trashicon.svg?react';
import SelectedIcon from '../../assets/icons/GreenTick.svg?react';
import TickPending from '../../assets/icons/tick_pending.svg?react';
import { TOAST_CONFIG } from '../../constants/index.ts';

const ChargesSharedVisit: React.FC<ChargesSharedVisitProps> = ({
  setShowModal,
  selectedPatients,
  reRenderPatients,
}) => {
  const [sharedVisitUsers, setSharedVisitUsers] = useState<SharedVisit[]>([]);
  const [selectedSharedVisits, setSelectedSharedVisits] = useState<SharedVisit[]>([]);

  useEffect(() => {
    handleFetchSharedVisitUsers();
    let SharedVisits: SharedVisit[] = [];
    selectedPatients.forEach((p) => {
      if (p.shared_visits) {
        p.shared_visits.forEach((sv) => {
          SharedVisits.push(sv);
        });
      }
    });
    SharedVisits = SharedVisits.filter(
      (sv, index, self) => index === self.findIndex((t) => t.id === sv.id),
    );

    setSelectedSharedVisits(SharedVisits);
  }, [selectedPatients]);

  const handleFetchSharedVisitUsers = async () => {
    try {
      const users: SharedVisit[] = await fetchSharedVisitUsers();
      setSharedVisitUsers(users);
    } catch (error) {
      console.error('Error fetching shared visit users:', error);
    }
  };

  const handleSave = async () => {
    const anyPatientsHaveSharedVisits = selectedPatients.some(
      (patient) => patient.shared_visits && patient.shared_visits.length > 0,
    );

    if (!anyPatientsHaveSharedVisits && selectedSharedVisits.length === 0) {
      toast.error('Please select at least one shared visit', TOAST_CONFIG.ERROR);
      return;
    }

    const ids_array: {
      patientId: number;
      sharedVisitId: number[] | null;
      charges_page_id: number | null;
      admission_id: number;
    }[] = [];
    if (selectedSharedVisits.length > 0) {
      selectedPatients.forEach((patient) => {
        selectedSharedVisits.forEach((sharedvisit) => {
          if (sharedvisit?.id) {
            ids_array.push({
              patientId: patient.patient_id,
              sharedVisitId: [sharedvisit.id],
              charges_page_id: patient.charges_page_id ?? null,
              admission_id: patient.id,
            });
          }
        });
        patient.shared_visits = selectedSharedVisits;
      });
    } else {
      selectedPatients.forEach((patient) => {
        ids_array.push({
          patientId: patient.patient_id,
          sharedVisitId: null,
          charges_page_id: patient.charges_page_id ?? null,
          admission_id: patient.id,
        });
        patient.shared_visits = [];
      });
    }
    await attachSharedVisitsToAdmission(ids_array as AttachSharedVisitPayload[]);
    setShowModal(false);
    reRenderPatients(' Shared Visits Updated! ');
  };

  const handleSharedVisitCode = (SharedVisitCode: SharedVisit) => {
    setSelectedSharedVisits([SharedVisitCode]);
  };

  const clearSelectedSharedVisits = () => {
    setSelectedSharedVisits([]);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <CustomModal
      isOpen={true}
      onClose={handleClose}
      title="Select the Shared Visits"
      className="max-w-4xl"
    >
      <div className="flex flex-col">
        {/* Two-panel layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[70vh] lg:h-[320px] mb-6">
          {/* Left Panel - Available Shared Visits */}
          <div className="bg-white rounded-2xl border border-input overflow-hidden">
            {/* Panel Header */}
            <div
              className="figma-dark-bg text-white text-center font-gotham-bold text-xs flex items-center justify-center"
              style={{
                background: 'var(--figma-icon-gradient)',
                height: '42px',
              }}
            >
              Shared Visits
            </div>

            {/* Panel Content */}
            <div
              className="flex-1 overflow-y-auto p-2.5 max-h-[calc(60vh-120px)] lg:max-h-[260px]"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--text-muted-semi) transparent',
              }}
            >
              <div className="space-y-2.5">
                {sharedVisitUsers.map((user, index) => (
                  <React.Fragment key={index}>
                    <div className="flex items-center justify-between py-1.5 px-3">
                      <div className="font-gotham-normal text-xs text-muted">{user.name}</div>
                      <button
                        onClick={() => handleSharedVisitCode(user)}
                        className="p-0.5 cursor-pointer hover:scale-110 transition-transform"
                      >
                        {selectedSharedVisits.some((sv) => sv.id === user.id) ? (
                          <SelectedIcon width={20} height={20} />
                        ) : (
                          <TickPending width={20} height={20} fill="var(--text-muted)" />
                        )}
                      </button>
                    </div>
                    {index < sharedVisitUsers.length - 1 && (
                      <div className="border-t border-subtle" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Selected Shared Visits */}
          <div className="bg-white rounded-2xl border border-input overflow-hidden">
            {/* Panel Header with Trash Icon */}
            <div
              className="figma-dark-bg text-white flex items-center justify-between px-4 font-gotham-bold text-xs gap-7"
              style={{
                background: 'var(--figma-icon-gradient)',
                height: '42px',
              }}
            >
              <span>Selected Shared Visit</span>
              <button
                onClick={clearSelectedSharedVisits}
                className="w-6 h-6 cursor-pointer bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                title="Clear all selected visits"
              >
                <TrashIcon width={14} height={14} fill="var(--text-white)" />
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-2.5 max-h-[calc(60vh-120px)] lg:max-h-[260px]">
              {selectedSharedVisits.length > 0 ? (
                <div className="space-y-2.5">
                  {selectedSharedVisits.map((user, index) => (
                    <div key={index} className="flex items-center justify-between py-1.5 px-3">
                      <div className="font-gotham-normal text-xs text-muted">{user.name}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted text-sm font-gotham">
                  No shared visits selected
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Divider Line */}
        <div className="border-t border-subtle w-full mb-5"></div>

        {/* Save Button - Full Width */}
        <div>
          <Button
            variant="primary"
            onClick={handleSave}
            className="w-full py-3 rounded-full font-gotham-bold text-sm"
            style={{
              background: 'var(--primary-color)',
              height: '42px',
              boxShadow: 'var(--figma-button-shadow)',
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </CustomModal>
  );
};

export default ChargesSharedVisit;

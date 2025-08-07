import React, { useEffect, useState, useMemo } from 'react';
import { fetchVisitCodes, updatePatientCharges } from '../../helpers/index.ts';
import TickPending from '../../assets/icons/tick_pending.svg?react';
import Trash from '../../assets/icons/Trashicon.svg?react';
import { toast } from 'react-toastify';
import { PatientChargeUpdate, VisitCode } from '../../types/index.ts';
import { ChargesVisitCodesProps } from '../../types/ChargesVisitCodes.types.ts';
import CustomModal from './CustomModal.tsx';
import Button from './custom/Button.tsx';
import SelectedIcon from '../../assets/icons/GreenTick.svg?react';
import { TOAST_CONFIG } from '../../constants/index.ts';

const ChargesVisitCodes: React.FC<ChargesVisitCodesProps> = ({
  setShowModal,
  selectedPatients,
  reRenderPatients,
}) => {
  const [visitCodes, setVisitCodes] = useState<VisitCode[]>([]);
  const [selectedVisitCodes, setSelectedVisitCodes] = useState<VisitCode[]>([]);

  useEffect(() => {
    handleFetchVisitCodes();
    let visitCodes: VisitCode[] = [];
    selectedPatients.map((p) => {
      return (
        p.visit_codes &&
        p.visit_codes.forEach((vc) => {
          visitCodes.push(vc);
        })
      );
    });
    //remove duplicates from visitCodes
    visitCodes = visitCodes.filter(
      (visitCode, index, self) => index === self.findIndex((t) => t.id === visitCode.id),
    );
    setSelectedVisitCodes(visitCodes);
  }, [selectedPatients]);

  const handleFetchVisitCodes = async () => {
    try {
      const visitCodes = await fetchVisitCodes();
      setVisitCodes(visitCodes);
    } catch (error) {
      console.error('Error fetching visit codes:', error);
    }
  };

  const handleSave = async () => {
    try {
      const ids_array: {
        patientId: number;
        chargesId: number | null;
        charges_page_id: number | null;
        admission_id: number;
      }[] = [];
      if (selectedVisitCodes.length > 0) {
        selectedPatients.forEach((patient) => {
          selectedVisitCodes.forEach((visitCode) => {
            ids_array.push({
              patientId: patient.patient_id,
              chargesId: visitCode.id ?? null,
              charges_page_id: patient.charges_page_id ?? null,
              admission_id: patient.id,
            });
          });
          patient.visit_codes = selectedVisitCodes;
        });
      } else {
        selectedPatients.forEach((patient) => {
          ids_array.push({
            patientId: patient.patient_id,
            chargesId: null,
            charges_page_id: patient.charges_page_id ?? null,
            admission_id: patient.id,
          });
          patient.visit_codes = [];
        });
      }
      const response = await updatePatientCharges(ids_array as PatientChargeUpdate[]);
      if (response?.ok) {
        const data = await response.json();
        setShowModal(false);
        reRenderPatients(data.message);
      } else {
        toast.error('Server responded with error', TOAST_CONFIG.ERROR);
      }
    } catch (error) {
      console.error('Error updating visit codes:', error);
      toast.error('Error updating visit codes', TOAST_CONFIG.ERROR);
    }
  };

  const handleVisitCode = (VisitCode: VisitCode, mode: 'add' | 'delete') => {
    if (mode === 'delete') {
      const updatedVC = selectedVisitCodes.filter((vc) => VisitCode.id !== vc.id);
      setSelectedVisitCodes(updatedVC);
    } else {
      const alreadyAdded = selectedVisitCodes.find((vc) => VisitCode.id === vc.id);
      if (alreadyAdded) {
        return;
      }
      const updatedVC = [...selectedVisitCodes, VisitCode];
      setSelectedVisitCodes(updatedVC);
    }
  };

  const categorizedCodes = useMemo(() => {
    return Array.isArray(visitCodes)
      ? visitCodes.reduce<Record<string, VisitCode[]>>((acc, code) => {
          if (!code.category) return acc;
          acc[code.category] = acc[code.category] || [];
          acc[code.category].push(code);
          return acc;
        }, {})
      : {};
  }, [visitCodes]);

  return (
    <CustomModal
      isOpen={true}
      onClose={() => setShowModal(false)}
      title="Select the Visit Codes"
      className="max-w-xl"
    >
      <div className="flex flex-col h-full">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Available Visit Codes - Left Column */}
          <div
            className="flex flex-col gap-2.5 p-2.5 bg-white rounded-xl border border-subtle overflow-y-auto"
            style={{
              borderColor: 'var(--border-subtle)',
              height: '263px',
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--text-muted-semi) transparent',
            }}
          >
            {Object.entries(categorizedCodes).map(([category, codes]) => (
              <div
                key={category}
                className="bg-white rounded-xl border border-input overflow-hidden flex-shrink-0"
              >
                {/* Category Header */}
                <div
                  className="px-3 py-3 text-white text-center font-bold text-xs"
                  style={{
                    background: 'var(--figma-icon-gradient)',
                    fontFamily: 'Gotham, sans-serif',
                  }}
                >
                  {category}
                </div>

                {/* Category Items */}
                <div className="p-1 space-y-1">
                  {codes.map((item, index) => (
                    <div key={index}>
                      <div className="flex items-center justify-between px-2 py-1.5">
                        <div className="flex-1 text-xs text-muted pr-2 font-gotham-normal">
                          <span className="text-secondary font-gotham-medium">
                            {item.visit_code}:
                          </span>{' '}
                          <span className="text-secondary">{item.description}</span>
                        </div>
                        <button
                          onClick={() => {
                            const originalCode = visitCodes.find((code) => code.id === item.id);
                            if (originalCode) handleVisitCode(originalCode, 'add');
                          }}
                          className="p-0.5 cursor-pointer hover:scale-110 transition-transform"
                        >
                          {selectedVisitCodes.some((vc) => vc.visit_code === item.visit_code) ? (
                            <SelectedIcon width={20} height={20} />
                          ) : (
                            <TickPending width={20} height={20} fill="var(--text-muted)" />
                          )}
                        </button>
                      </div>
                      {index < codes.length - 1 && (
                        <div
                          className="h-px mx-2"
                          style={{ backgroundColor: 'var(--border-subtle)' }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Selected Visit Codes - Right Column */}
          <div
            className="bg-white rounded-xl border border-input overflow-hidden flex flex-col"
            style={{
              height: '263px',
            }}
          >
            {/* Selected Header */}
            <div
              className="px-3 py-2 text-white font-bold text-xs flex items-center justify-between flex-shrink-0"
              style={{
                background: 'var(--figma-icon-gradient)',
                fontFamily: 'Gotham, sans-serif',
              }}
            >
              <span>Selected Visit Codes</span>
              {selectedVisitCodes.length > 0 && (
                <button
                  onClick={() => setSelectedVisitCodes([])}
                  className="w-7 h-7 cursor-pointer bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <Trash width={15} height={15} fill="var(--text-white)" />
                </button>
              )}
            </div>

            {/* Selected Items */}
            <div
              className="flex-1 p-1 space-y-1 overflow-y-auto"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--text-muted-semi) transparent',
              }}
            >
              {selectedVisitCodes.length === 0 ? (
                <div className="text-center py-6 text-muted text-sm font-gotham">
                  No visit codes selected
                </div>
              ) : (
                selectedVisitCodes.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between px-2 py-1.5">
                      <div className="flex-1 text-xs text-muted pr-2 font-gotham-normal">
                        <span className="text-secondary font-gotham-medium">
                          {item.visit_code}:
                        </span>{' '}
                        <span className="text-secondary">{item.description}</span>
                      </div>
                      <button
                        onClick={() => handleVisitCode(item, 'delete')}
                        className="w-7 h-7 cursor-pointer bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <Trash width={15} height={15} fill="var(--text-white)" />
                      </button>
                    </div>
                    {index < selectedVisitCodes.length - 1 && (
                      <div
                        className="h-px mx-2"
                        style={{ backgroundColor: 'var(--border-subtle)' }}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center pt-3 border-t border-gray-100">
          <Button
            variant="primary"
            onClick={handleSave}
            className="w-full"
            style={{
              background: 'var(--primary-color)',
              boxShadow: 'var(--figma-button-shadow)',
              fontFamily: 'Gotham, sans-serif',
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </CustomModal>
  );
};

export default ChargesVisitCodes;

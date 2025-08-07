import React, { useState, useEffect, useRef } from 'react';
import Trash from '../../assets/icons/Trashicon.svg?react';
import CustomModal from './CustomModal';
import { convertNotes } from '../../helpers';
import { toast } from 'react-toastify';
import Button from './custom/Button';
import { DiagnosisProps, DiagnosisItem } from '../../types/Diagnosis.types.ts';
import DiagnosisReviewTable from '../single/DiagnosisReviewTable.tsx';
import { Diagnosis as BestGuessCode, DetailedDiagnosis } from '../../types/index.ts';
import DiagnosisCodeSuggestions from '../single/DiagnosisCodeSuggestions.tsx';
import { TOAST_CONFIG } from '../../constants/index.ts';

const MAX_DIAGNOSIS_COUNT = 12;

const Diagnosis: React.FC<DiagnosisProps> = ({
  handleSelectedDiagnosis,
  DiagnosisArray,

  onClose,
  open,
}) => {
  const [showModal, setShowModal] = useState<boolean>(open ?? false);
  const [showDiagnosisReviewModal, setShowDiagnosisReviewModal] = useState<boolean>(false);
  const [showDiagnosisSuggestions, setShowDiagnosisSuggestions] = useState<boolean>(false);
  const [notesInput, setNotesInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detailed_diagnoses, setDetailedDiagnoses] = useState<DetailedDiagnosis[]>([]);
  const [SuggestedDiagnosis, setSuggestedDiagnosis] = useState<BestGuessCode[]>([]);
  const [diagnosisLabel, setDiagnosisLabel] = useState<string>('');
  const [clarificationNeededCodeId, setClarificationNeededCodeId] = useState<number>(0);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<DiagnosisItem[]>(DiagnosisArray);
  const [tempSelectedDiagnosis, setTempSelectedDiagnosis] =
    useState<DiagnosisItem[]>(DiagnosisArray);

  // Ref to the suggestions section – used for auto-scrolling when it becomes visible
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Hide suggestions helper
  const hideSuggestions = () => {
    setShowDiagnosisSuggestions(false);
    setSuggestedDiagnosis([]);
  };

  const handleSave = () => {
    handleSelectedDiagnosis(tempSelectedDiagnosis);
    setSelectedDiagnosis(tempSelectedDiagnosis);
    toggleModal();
  };

  useEffect(() => {
    if (DiagnosisArray.length > 0) {
      setSelectedDiagnosis(DiagnosisArray);
      setTempSelectedDiagnosis(DiagnosisArray);
    }
  }, [DiagnosisArray]);

  useEffect(() => {
    if (typeof open === 'boolean') {
      setShowModal(open);
    }
  }, [open]);

  // When suggestions are toggled on, scroll them into view so the user can see them immediately
  useEffect(() => {
    if (showDiagnosisSuggestions && suggestionsRef.current) {
      // Smoothly scroll the suggestions section into view within the modal
      suggestionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showDiagnosisSuggestions]);

  const toggleModal = () => {
    if (typeof open === 'boolean') {
      if (showModal && onClose) {
        onClose();
      }
    } else {
      setShowModal((prev) => !prev);
    }
    setTempSelectedDiagnosis(selectedDiagnosis);
  };

  const closeModal = () => {
    setShowDiagnosisReviewModal(false);
    setDetailedDiagnoses([]);
    setShowModal(true);
    hideSuggestions();
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotesInput(e.target.value);
  };

  const handleConvertNotes = async (e: React.FormEvent) => {
    e.preventDefault();

    if (tempSelectedDiagnosis.length >= MAX_DIAGNOSIS_COUNT) {
      toast.error(
        'Limit of 12 ICD10 codes reached. Please delete one or more to continue.',
        TOAST_CONFIG.ERROR,
      );
      return;
    }

    if (!notesInput.trim()) {
      toast.warning('Please enter notes to convert', TOAST_CONFIG.WARNING);
      return;
    }

    setIsLoading(true);

    try {
      const data = await convertNotes(notesInput);
      if (data.detailed_diagnoses.length === 0) {
        toast.info('No new diagnoses found or all diagnoses already added', TOAST_CONFIG.INFO);
        return;
      }
      setDetailedDiagnoses(data.detailed_diagnoses);
      setShowModal(false);
      setShowDiagnosisReviewModal(true);
      toast.success('Notes converted successfully', TOAST_CONFIG.SUCCESS);

      setNotesInput('');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(
          error.message || 'An error occurred while converting notes',
          TOAST_CONFIG.ERROR,
        );
      }
      setShowDiagnosisReviewModal(false);
    } finally {
      setIsLoading(false);
    }
  };

  const viewSuggestedICDCodes = (
    selectedDiagnosis: BestGuessCode[],
    physicianDiagnosis: string,
    selectedClarificationNeededCodeId: number,
  ) => {
    setClarificationNeededCodeId(selectedClarificationNeededCodeId);
    setSuggestedDiagnosis(selectedDiagnosis);
    setDiagnosisLabel(physicianDiagnosis);
    setShowDiagnosisSuggestions(true);

    // Ensure the suggestions section is scrolled into view on every click
    setTimeout(() => {
      if (suggestionsRef.current) {
        suggestionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 0);
  };

  function onDiagnosisCodeSuggestionSelect(code: string, description: string, id: number) {
    setDetailedDiagnoses((prevDiagnoses) => {
      const updatedDiagnoses = prevDiagnoses.map((diagnosis) => {
        if (diagnosis.assigned_icd_diagnosis.id === clarificationNeededCodeId) {
          return {
            ...diagnosis,
            previous_codes_id: clarificationNeededCodeId,
            best_guess_codes: [],
            notes: 'Verified Match',
            queries: [],
            assigned_icd_diagnosis: {
              ...diagnosis.assigned_icd_diagnosis,
              id: id,
              code: code,
              description: description,
            },
          };
        }
        return diagnosis;
      });
      return updatedDiagnoses;
    });
    setShowDiagnosisSuggestions(false);
    setSuggestedDiagnosis([]);
  }

  const handleReviewSubmit = () => {
    const verifiedOnly = detailed_diagnoses.filter((diag) =>
      diag.notes?.toLowerCase().startsWith('verified match'),
    );

    let mappedDiagnoses: DiagnosisItem[] = verifiedOnly.map((diag) => ({
      id: diag.assigned_icd_diagnosis.id,
      code: diag.assigned_icd_diagnosis.code,
      description: diag.assigned_icd_diagnosis.description,
      is_primary: diag.assigned_icd_diagnosis.is_primary,
    }));

    // Ensure single primary across existing + new diagnoses
    const hasExistingPrimary = selectedDiagnosis.some((d) => d.is_primary);

    mappedDiagnoses = mappedDiagnoses.map((diag) => {
      if (hasExistingPrimary) {
        if (diag.is_primary) {
          return { ...diag, is_primary: false };
        }
      }
      return diag;
    });

    const existingCodes = new Set(tempSelectedDiagnosis.map((d) => d.code));
    const newDiagnoses = mappedDiagnoses.filter((d) => !existingCodes.has(d.code));

    if (tempSelectedDiagnosis.length + newDiagnoses.length > MAX_DIAGNOSIS_COUNT) {
      toast.error(
        'Limit of 12 ICD10 codes reached. Please delete one or more to continue.',
        TOAST_CONFIG.ERROR,
      );
      return;
    }

    if (newDiagnoses.length > 0) {
      toast.success(`${newDiagnoses.length} verified diagnoses added`, TOAST_CONFIG.SUCCESS);
    } else {
      toast.info('No new diagnoses to add', TOAST_CONFIG.INFO);
    }

    // Update the temporary selection with the new diagnoses
    setTempSelectedDiagnosis((prev) => [...prev, ...newDiagnoses]);

    setShowDiagnosisReviewModal(false);
    setShowModal(true);
  };

  const handleDelete = (itemToDelete: DiagnosisItem) => {
    const updatedDiagnoses = tempSelectedDiagnosis.filter((item) => item.id !== itemToDelete.id);
    setTempSelectedDiagnosis(updatedDiagnoses);
  };

  return (
    <div className="w-full">
      <CustomModal isOpen={showModal} onClose={toggleModal} title="Diagnosis" className="max-w-4xl">
        <div className="flex justify-center items-center bg-subtle rounded-lg p-4">
          <div className="flex flex-col md:flex-row w-full bg-white rounded-2xl shadow-sm">
            <div className="md:w-1/2 flex flex-col gap-3 p-4 border-b md:border-b-0 md:border-r border-subtle">
              <h4 className="font-gotham-medium text-xs text-secondary opacity-60">
                Convert Notes to ICD-10
              </h4>
              <textarea
                className="w-full h-48 resize-none border-input rounded-2xl p-4 text-sm text-secondary focus:outline-none focus:ring-2 focus-ring-primary focus-border-primary scrollbar-thin scrollbar-track-[var(--input-bg)] scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500 bg-[var(--input-bg)]"
                placeholder="Paste your notes here or type for diagnosis..."
                value={notesInput}
                onChange={handleNotesChange}
              ></textarea>
              <Button
                variant="dark"
                className="w-full mt-4"
                onClick={handleConvertNotes}
                loading={isLoading}
                loadingText="Converting..."
                size="small"
                paddingLevel={5}
              >
                Convert Notes
              </Button>
            </div>

            {/* Right panel – Selected Diagnosis (already converted) */}
            <div className="md:w-1/2">
              {/* Header gradient strip */}
              <div className="h-10 rounded-t-2xl figma-icon-gradient flex items-center justify-center">
                <p className="font-gotham-bold text-white text-sm">Selected Diagnosis</p>
              </div>

              {/* Diagnoses list */}
              <div className="border border-subtle border-t-0 rounded-b-2xl h-[260px] overflow-y-auto overflow-x-hidden">
                {tempSelectedDiagnosis
                  ?.slice()
                  .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
                  .map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between px-2 py-1.5 border-b last:border-none border-subtle"
                    >
                      <div className="flex-1 text-xs  pr-2">
                        {/* Primary indicator */}

                        <div className="flex-1 text-sm  pr-2" style={{ fontFamily: 'Gotham' }}>
                          {item.is_primary && <span className="text-error-custom">*</span>}
                          <span className="text-primary font-gotham-medium">{item.code}:</span>{' '}
                          <span className="text-secondary">{item.description}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(item)}
                        className="w-7 h-7 bg-error-custom cursor-pointer rounded-full flex items-center justify-center hover:opacity-90 transition-colors ml-2 mt-0.5"
                        aria-label="Delete diagnosis"
                      >
                        <Trash width={15} height={15} fill="var(--text-white)" />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-center">
          <Button
            variant="primary"
            onClick={handleSave}
            paddingLevel={5}
            className="w-[720px] max-w-full"
          >
            Save
          </Button>
        </div>
      </CustomModal>

      <CustomModal
        isOpen={showDiagnosisReviewModal && detailed_diagnoses?.length > 0}
        onClose={closeModal}
        title="Convert Notes to ICD-10 Review"
      >
        <DiagnosisReviewTable
          detailed_diagnoses={detailed_diagnoses}
          viewSuggestedICDCodes={viewSuggestedICDCodes}
          handleReviewSubmit={handleReviewSubmit}
          setDetailedDiagnoses={setDetailedDiagnoses}
          hideSuggestions={hideSuggestions}
        />

        {showDiagnosisSuggestions && (
          <div ref={suggestionsRef}>
            <DiagnosisCodeSuggestions
              diagnosisLabel={diagnosisLabel}
              suggestions={SuggestedDiagnosis}
              onSelect={onDiagnosisCodeSuggestionSelect}
              setSuggestedDiagnosis={setSuggestedDiagnosis}
            />
          </div>
        )}
      </CustomModal>
    </div>
  );
};

export default Diagnosis;

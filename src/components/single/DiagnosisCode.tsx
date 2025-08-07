import { useState, useRef, useEffect, ChangeEvent, MouseEvent } from 'react';
import { toast } from 'react-toastify';
import { convertNotes } from '../../helpers';
import { DiagnosisCodeProps } from '../../types/DiagnosisCode.type.ts';
import DiagnosisReviewTable from './DiagnosisReviewTable.tsx';
import { Diagnosis as BestGuessCode, DetailedDiagnosis } from '../../types/index.ts';
import { DiagnosisItem } from '../../types/Diagnosis.types.ts';
import DiagnosisCodeSuggestions from './DiagnosisCodeSuggestions.tsx';
import Button from '../reusable/custom/Button';
import Trash from '../../assets/icons/Trashicon.svg?react';
import CustomModal from '../reusable/CustomModal';
import { TOAST_CONFIG } from '../../constants/index.ts';

const MAX_DIAGNOSIS_COUNT = 12;

function DiagnosisCode({
  selectedDiagnosisCodes,
  handleChange,
  updateSelectedCode,
}: DiagnosisCodeProps) {
  const [notesInput, setNotesInput] = useState<string>('');
  const [detailed_diagnoses, setDetailedDiagnoses] = useState<DetailedDiagnosis[]>([]);
  const [showDiagnosisReviewModal, setShowDiagnosisReviewModal] = useState<boolean>(false);
  const [showDiagnosisSuggestions, setShowDiagnosisSuggestions] = useState<boolean>(false);
  const [SuggestedDiagnosis, setSuggestedDiagnosis] = useState<BestGuessCode[]>([]);
  const [diagnosisLabel, setDiagnosisLabel] = useState<string>('');
  const [clarificationNeededCodeId, setClarificationNeededCodeId] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showDiagnosisSuggestions && suggestionsRef.current) {
      suggestionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showDiagnosisSuggestions]);

  const handleNotesChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setNotesInput(e.target.value);
  };

  const closeModal = () => {
    setShowDiagnosisReviewModal(false);
    setDetailedDiagnoses([]);
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

    setTimeout(() => {
      if (suggestionsRef.current) {
        suggestionsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 0);
  };

  const handleConvertNotes = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (selectedDiagnosisCodes.length >= MAX_DIAGNOSIS_COUNT) {
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
      setShowDiagnosisReviewModal(true);

      toast.success('Notes converted and codes added successfully', TOAST_CONFIG.SUCCESS);
      setNotesInput('');
    } catch (error) {
      setShowDiagnosisReviewModal(false);
      if (error instanceof Error) {
        toast.error(
          error.message || 'An error occurred while converting notes',
          TOAST_CONFIG.ERROR,
        );
      }
    } finally {
      setIsLoading(false);
    }
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
              description: description,
              code: code,
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

    // Ensure there is at most ONE primary diagnosis across existing + new items
    const hasExistingPrimary = selectedDiagnosisCodes.some((d) => d.is_primary);

    mappedDiagnoses = mappedDiagnoses.map((diag) => {
      if (hasExistingPrimary) {
        if (diag.is_primary) {
          return { ...diag, is_primary: false };
        }
      }
      return diag;
    });

    const existingCodes = new Set(selectedDiagnosisCodes.map((d) => d.code));
    const newDiagnoses = mappedDiagnoses.filter((d) => !existingCodes.has(d.code));

    if (selectedDiagnosisCodes.length + newDiagnoses.length > MAX_DIAGNOSIS_COUNT) {
      toast.error(
        'Limit of 12 ICD10 codes reached. Please delete one or more to continue.',
        TOAST_CONFIG.ERROR,
      );
      return;
    }

    newDiagnoses.forEach((item) => handleChange('diagnosisCodes', item));

    setShowDiagnosisReviewModal(false);

    if (newDiagnoses.length > 0) {
      toast.success(`${newDiagnoses.length} verified diagnoses added`, TOAST_CONFIG.SUCCESS);
    } else {
      toast.info('No new diagnoses to add', TOAST_CONFIG.INFO);
    }
  };

  // Helper to hide suggestions modal from child component
  const hideSuggestions = () => {
    // Close the suggestions view and clear any stored suggestions
    setShowDiagnosisSuggestions(false);
    setSuggestedDiagnosis([]);
  };

  return (
    <div className="grid grid-cols-1 notes-icd lg:grid-cols-2 gap-2.5 bg-white rounded-2xl  p-2.5 w-full">
      {/* Convert notes column */}
      <div className="flex flex-col bg-white rounded-2xl  border border-input overflow-hidden">
        <div
          className="px-3 min-h-[38px]  flex items-center justify-center text-white text-center font-bold text-xs sm:text-xs 2xl:text-sm shadow-[0_8px_16px_-4px_rgba(47,58,67,0.1)] rounded-t-2xl"
          style={{ background: 'var(--figma-icon-gradient)' }}
        >
          Convert Notes to ICD-10
        </div>
        <div className="px-3 py-2 flex flex-col gap-2">
          <textarea
            className="w-full h-28 diagnosis-code-textarea overflow-y-auto scrollbar-thin resize-none border-input rounded-2xl p-2 2xl:p-4 text-xs 2xl:text-base text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Paste your notes here or type for diagnosis..."
            value={notesInput}
            onChange={handleNotesChange}
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--text-muted-semi) transparent',
            }}
          ></textarea>
          <Button
            type="button"
            variant="dark"
            className="w-full"
            onClick={handleConvertNotes}
            loading={isLoading}
            size="small"
            loadingText="Converting..."
          >
            Convert Notes
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border-input flex flex-col overflow-hidden">
        <div className="px-3 min-h-[38px] text-white font-bold text-xs sm:text-xs 2xl:text-sm flex items-center justify-between figma-button-shadow rounded-t-2xl figma-icon-gradient ">
          <span>Selected Diagnosis</span>
        </div>
        <div
          className="flex-1 diagnosis-area overflow-y-auto px-3 space-y-1 min-h-[190px] max-h-[190px] scrollbar-thin "
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--text-muted-semi) transparent' }}
        >
          {selectedDiagnosisCodes
            ?.slice()
            .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
            .map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between py-1.5 text-[10px] sm:text-xs 2xl:text-sm text-muted">
                  <div className="flex-1 pr-2 font-gotham-normal text-secondary">
                    {item?.is_primary && <span className="text-diagnosis-primary mr-1">*</span>}
                    <span className="font-gotham-medium text-secondary">{item.code}:</span>{' '}
                    {item.description}
                  </div>
                  <button
                    type="button"
                    className="w-6 h-6 cursor-pointer flex items-center justify-center rounded-full bg-diagnosis-delete hover:scale-105 transition-transform"
                    onClick={() => updateSelectedCode('diagnosisCodes', item)}
                  >
                    <Trash width={12} height={12} className="fill-white" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      <CustomModal
        isOpen={showDiagnosisReviewModal && detailed_diagnoses.length > 0}
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
}

export default DiagnosisCode;

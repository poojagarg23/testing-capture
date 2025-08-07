import { Diagnosis as BestGuessCode, DetailedDiagnosis } from './index.ts';

type DiagnosisReviewTableProps = {
  detailed_diagnoses: DetailedDiagnosis[];
  viewSuggestedICDCodes: (
    selectedDiagnosis: BestGuessCode[],
    physicianDiagnosis: string,
    selectedCodeId: number,
  ) => void;
  handleReviewSubmit: () => void;
  setDetailedDiagnoses: React.Dispatch<React.SetStateAction<DetailedDiagnosis[]>>;
  hideSuggestions: () => void;
};

export default DiagnosisReviewTableProps;

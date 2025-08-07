import { Diagnosis as BestGuessCode } from './index';

export interface DiagnosisCodeSuggestionsProps {
  diagnosisLabel: string;
  suggestions: BestGuessCode[];
  onSelect: (code: string, description: string, id: number) => void;
  setSuggestedDiagnosis: React.Dispatch<React.SetStateAction<BestGuessCode[]>>;
}

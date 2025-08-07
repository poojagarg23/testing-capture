import { Diagnosis } from './index.ts';
export interface DiagnosisCodeProps {
  selectedDiagnosisCodes: Diagnosis[];
  handleChange: (_field: string, _value: Diagnosis) => void;
  updateSelectedCode: (_field: string, _item: Diagnosis) => void;
}

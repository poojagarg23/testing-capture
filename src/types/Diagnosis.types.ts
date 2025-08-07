import type { Mode, SubMode } from './index';

export interface DiagnosisItem {
  id: number;
  code: string;
  description: string;
  is_primary: boolean;
}

export interface DiagnosisProps {
  handleSelectedDiagnosis: (_diagnosis: DiagnosisItem[]) => void;
  DiagnosisArray: DiagnosisItem[];
  subMode?: SubMode;
  mode?: Mode;

  showAddButton?: boolean;
  /** Callback when modal is fully closed */
  onClose?: () => void;
  /** If provided, the component becomes controlled and uses this value to open/close the modal */
  open?: boolean;
}

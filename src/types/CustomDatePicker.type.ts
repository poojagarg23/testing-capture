import type { Mode, SubMode } from './index';

export interface CustomDatePickerProps {
  value: Date | string | null;
  onChange: (_date: Date) => void;
  disabled?: boolean;
  mode: Mode;
  subMode?: SubMode;
  placeholder?: string;
  required?: boolean;
  className?: string;
  type?: string;
  id?: string;
}

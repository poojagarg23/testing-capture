import { VisitCode } from './index.ts';

export interface VisitCodeProps {
  visitCodes: VisitCode[];
  selectedVisitCodes: VisitCode[];
  handleChange: (_field: string, _value: VisitCode) => void;
  updateSelectedCode: (_field: string, _item: VisitCode) => void;
}

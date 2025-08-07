import { Consult, VisibleColumns } from './ConsultsTrackingTable.types.ts';

export interface TableRowProps {
  consults: Consult;
  isEditMode: boolean;
  setConsults: React.Dispatch<React.SetStateAction<Consult[]>>;
  visibleColumns: VisibleColumns;
}

export interface FilterState {
  facilityName: (string | number)[];
  assignedProvider: string[];
  status: string;
}

export interface SortState {
  column: string | null;
  order: 'asc' | 'desc' | null;
}

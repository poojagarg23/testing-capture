import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import CustomModal from './CustomModal';
import Button from './custom/Button';
import CustomCheckbox from './CustomCheckbox';
import { TOAST_CONFIG } from '../../constants';

interface Column {
  key: string;
  label: string;
  isVisible: boolean;
}

interface SelectColumnsModalProps {
  isOpen: boolean;
  onClose: () => void;
  visibleColumns: string[];
  onColumnsChange: (columns: string[]) => void;

  availableColumns?: { key: string; label: string }[];
}

const SelectColumnsModal: React.FC<SelectColumnsModalProps> = ({
  isOpen,
  onClose,
  visibleColumns,
  onColumnsChange,
  availableColumns: availableColumnsProp,
}) => {
  // Default column set used by Consult Tracker as a fallback when no custom columns are supplied.
  const defaultConsultColumns: { key: string; label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'facility', label: 'Facility Name' },
    { key: 'room', label: 'Room Number' },
    { key: 'dob', label: 'Dob' },
    { key: 'dateRequested', label: 'Date Requested' },
    { key: 'timeRequested', label: 'Time Requested' },
    { key: 'visitDate', label: 'Visit Date' },
    { key: 'followupDate', label: 'Followup Date' },
    { key: 'provider', label: 'Assigned Provider' },
    { key: 'insurance', label: 'Insurance Carrier' },
    { key: 'rehabDx', label: 'Rehab Diagnosis' },
    { key: 'rec', label: 'Rehab Recs' },
    { key: 'notes', label: 'Notes' },
    { key: 'status', label: 'Status' },
  ];

  // Merge the provided columns (if any) with a visible flag. All columns are visible by default;
  // their actual visibility will be synchronised with the `visibleColumns` prop in a `useEffect`.
  const allColumns: Column[] = useMemo(() => {
    const base = availableColumnsProp ?? defaultConsultColumns;
    return base.map((c) => ({ ...c, isVisible: true }));
  }, [availableColumnsProp]);

  const [columns, setColumns] = useState<Column[]>(allColumns);

  useEffect(() => {
    // Update local state when visibleColumns prop changes
    const updatedColumns = allColumns.map((col) => ({
      ...col,
      isVisible: visibleColumns.includes(col.key),
    }));
    setColumns(updatedColumns);
  }, [allColumns, visibleColumns]);

  const handleColumnToggle = (columnKey: string) => () => {
    setColumns((prev) =>
      prev.map((col) => (col.key === columnKey ? { ...col, isVisible: !col.isVisible } : col)),
    );
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setColumns((prev) => prev.map((col) => ({ ...col, isVisible: isChecked })));
  };

  const handleDone = () => {
    const selectedColumns = columns.filter((col) => col.isVisible).map((col) => col.key);

    if (selectedColumns.length === 0) {
      toast.warning('Please select at least one column to display', TOAST_CONFIG.WARNING);
      return;
    }

    onColumnsChange(selectedColumns);
    onClose();
  };

  const allSelected = columns.length > 0 && columns.every((col) => col.isVisible);

  // Split columns into two groups for two-column layout
  const leftColumns = columns.slice(0, Math.ceil(columns.length / 2));
  const rightColumns = columns.slice(Math.ceil(columns.length / 2));

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      useFixedWidth={true}
      title="Select Visible Columns"
    >
      <div className="p-4 sm:p-8 ">
        {/* Select All Checkbox */}
        <div className="mb-6">
          <CustomCheckbox
            checked={allSelected}
            onChange={handleSelectAll}
            label="All"
            className="font-gotham-medium text-base 2xl:text-lg"
          />
        </div>

        {/* Columns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 2xl:gap-x-10 mb-8 2xl:mb-12">
          {/* Left Column */}
          <div className="space-y-4 2xl:space-y-8">
            {leftColumns.map((column) => (
              <CustomCheckbox
                key={column.key}
                checked={column.isVisible}
                onChange={handleColumnToggle(column.key)}
                label={column.label}
                className="font-gotham-medium text-base 2xl:text-lg"
              />
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-4 2xl:space-y-8">
            {rightColumns.map((column) => (
              <CustomCheckbox
                key={column.key}
                checked={column.isVisible}
                onChange={handleColumnToggle(column.key)}
                label={column.label}
                className="font-gotham-medium text-base 2xl:text-lg"
              />
            ))}
          </div>
        </div>

        {/* Done Button */}
        <div className="flex justify-center">
          <Button
            variant="primary"
            onClick={handleDone}
            className="w-full max-w-xs px-8 py-3 2xl:max-w-md 2xl:px-16 2xl:py-5 text-base 2xl:text-xl"
          >
            Done
          </Button>
        </div>
      </div>
    </CustomModal>
  );
};

export default SelectColumnsModal;

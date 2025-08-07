import React from 'react';
import Dropdown from './Dropdown';

interface Option {
  label: string;
  value: string | number;
}

interface EditableSelectProps {
  id: string;
  field: string;
  value: string | number;
  options: Option[];
  placeholder?: string;
  isEditMode: boolean;
  onUpdate: (id: string, field: string, value: string) => void;
  onSave: (id: string, directChange?: { field: string; value: string }) => void;
  className?: string;
}

const EditableSelect: React.FC<EditableSelectProps> = ({
  id,
  field,
  value,
  options,
  placeholder = 'Select option',
  isEditMode,
  onUpdate,
  onSave,
  className = '',
}) => {
  if (!isEditMode) {
    const selectedOption = options.find((opt) => opt.value === value);
    return <span>{selectedOption?.label || String(value)}</span>;
  }

  const handleChange = (newValue: string | number | (string | number)[]) => {
    // Handle single value (our use case)
    const stringValue = Array.isArray(newValue) ? String(newValue[0] || '') : String(newValue);
    onUpdate(id, field, stringValue);
    // Auto-save immediately after selection
    onSave(id, { field, value: stringValue });
  };

  return (
    <div className={`relative ${className}`}>
      <Dropdown
        options={options}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        maxWidth="100%"
        className="w-full"
        disableFocus={true}
        textClassName="!text-sm "
      />
    </div>
  );
};

export default EditableSelect;

import React, { useState, useEffect } from 'react';
import InputField from './InputField.tsx';
import { formatISODate } from '../../../helpers/dateUtils.ts';

interface EditableFieldProps {
  id: string;
  field: string;
  value: string;
  type?: 'text' | 'date' | 'time';
  placeholder?: string;
  label?: string;
  required?: boolean;
  isEditMode: boolean;
  onUpdate: (id: string, field: string, value: string) => void;
  onSave: (id: string) => void;
  className?: string;
}

const EditableField: React.FC<EditableFieldProps> = ({
  id,
  field,
  value,
  type = 'text',
  placeholder,
  label,
  required = false,
  isEditMode,
  onUpdate,
  onSave,
  className = '',
}) => {
  // Local state to allow free typing without being cleared by parent re-renders (e.g. incomplete dates)
  const [localValue, setLocalValue] = useState<string>(value);

  // Keep local state in sync when parent value changes or when switching edit modes
  useEffect(() => {
    setLocalValue(value);
  }, [value, isEditMode]);

  if (!isEditMode) {
    return <span>{value}</span>;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    let processedVal = newVal;

    // If the input is type=date, constrain the year segment to 4 digits
    if (type === 'date' && newVal) {
      const parts = newVal.split('-');
      if (parts.length > 0) {
        const year = parts[0].slice(0, 4).replace(/[^0-9]/g, '');
        parts[0] = year;
        processedVal = parts.join('-');
      }

      // If month/day are single-digit, or overall matches yyyy-m-d, pad via formatISODate
      if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(processedVal)) {
        processedVal = formatISODate(processedVal);
      }
    }

    setLocalValue(processedVal);
    onUpdate(id, field, processedVal);
  };

  return (
    <InputField
      id={id}
      label={label}
      type={type}
      placeholder={placeholder}
      value={localValue}
      required={required}
      onChange={handleChange}
      onBlur={() => onSave(id)}
      className={className}
    />
  );
};

export default EditableField;

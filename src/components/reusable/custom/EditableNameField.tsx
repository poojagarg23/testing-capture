import React from 'react';

interface EditableNameFieldProps {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  isEditMode: boolean;
  onUpdate: (id: string, field: string, value: string) => void;
  onSave: (id: string) => void;
  displayValue: string;
}

const EditableNameField: React.FC<EditableNameFieldProps> = ({
  id,
  firstName,
  middleName,
  lastName,
  isEditMode,
  onUpdate,
  onSave,
  displayValue,
}) => {
  if (!isEditMode) {
    return <span>{displayValue}</span>;
  }

  const handleAlphabeticKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedControlKeys = [
      'Backspace',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Delete',
      'Home',
      'End',
    ];

    if (!allowedControlKeys.includes(e.key) && !/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  // Render two separate inputs while editing

  return (
    <div className="flex flex-row gap-2 w-full">
      {/* Last Name (required) */}
      <div className="flex flex-col gap-2 w-full">
        <label className="text-xs 2xl:text-sm text-secondary">
          Last Name <span className="text-error">*</span>
        </label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => onUpdate(id, 'lastname', e.target.value)}
          onBlur={() => onSave(id)}
          placeholder="Last Name"
          required
          className="flex-1 px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus-ring-primary focus-border-primary h-9 transition-colors duration-200"
          onKeyDown={handleAlphabeticKeyDown}
        />
      </div>
      {/* First Name (required) */}
      <div className="flex flex-col gap-2 w-full">
        <label className="text-xs 2xl:text-sm text-secondary">
          First Name <span className="text-error">*</span>
        </label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => onUpdate(id, 'firstname', e.target.value)}
          onBlur={() => onSave(id)}
          placeholder="First Name"
          required
          className="flex-1 px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus-ring-primary focus-border-primary h-9 transition-colors duration-200"
          onKeyDown={handleAlphabeticKeyDown}
        />
      </div>
      {/* Middle Name */}
      <div className="flex flex-col gap-2 w-full">
        <label className="text-xs 2xl:text-sm text-secondary">Middle Name</label>
        <input
          type="text"
          value={middleName}
          onChange={(e) => onUpdate(id, 'middlename', e.target.value)}
          onBlur={() => onSave(id)}
          placeholder="Middle Name"
          className="flex-1 px-3 py-2 text-sm border border-input rounded-md focus:outline-none focus:ring-2 focus-ring-primary focus-border-primary h-9 transition-colors duration-200"
          onKeyDown={handleAlphabeticKeyDown}
        />
      </div>
    </div>
  );
};

export default EditableNameField;

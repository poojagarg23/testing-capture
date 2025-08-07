import React from 'react';

interface CustomCheckboxProps {
  /** Whether the checkbox is checked */
  checked: boolean;
  /** Change handler receiving the native input event */
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Visible label text */
  label: string;
  /** Optional class for the outer wrapper */
  className?: string;
  /** Optional class for the label element */
  labelClassName?: string;
  /** Disable interactions */
  disabled?: boolean;
  /** Input id. Falls back to `name` or slugified label */
  id?: string;
  /** Input name */
  name?: string;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onChange,
  label,
  className = '',
  labelClassName = '',
  disabled = false,
  id,
  name,
}) => {
  // Generate fallback id when none supplied
  const inputId = id || name || `checkbox-${label.replace(/\s+/g, '-')}`;

  return (
    <div className={`flex relative items-center gap-3 ${className}`}>
      {/* Visible checkbox */}
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          id={inputId}
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="w-5 h-5 cursor-pointer rounded border-2 border-input-focus bg-[var(--input-bg)] focus:ring-2 focus-ring-primary focus-border-primary appearance-none checked:bg-[var(--primary-blue)] checked:border-[var(--primary-blue)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        />
        {checked && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
              <path
                d="M10 3L4.5 8.5L2 6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Label */}
      <label
        htmlFor={inputId}
        className={`font-gotham-medium text-sm text-secondary cursor-pointer select-none whitespace-normal break-words ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${labelClassName}`}
      >
        {label}
      </label>
    </div>
  );
};

export default CustomCheckbox;

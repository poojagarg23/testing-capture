import React from 'react';

interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
  labelClassName?: string;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  onChange,
  label,
  className = '',
  labelClassName = '',
  disabled = false,
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex items-center justify-center">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="w-5 h-5 cursor-pointer rounded border-2 border-input bg-[var(--input-bg)] focus:ring-2 focus-ring-primary focus-border-primary appearance-none checked:bg-[var(--primary-blue)] checked:border-[var(--primary-blue)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
      <label
        htmlFor={id}
        className={`font-gotham-medium text-sm text-secondary cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${labelClassName}`}
      >
        {label}
      </label>
    </div>
  );
};

export default Checkbox;

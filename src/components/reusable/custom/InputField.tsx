import React, { useState, useEffect } from 'react';
import { formatISODate, isDateValid } from '../../../helpers/dateUtils';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
  error?: string;
  required?: boolean;
  icon?: React.ReactNode;
  labelClassName?: string;
  /** When true, input will accept only alphabetical characters and spaces */
  alphaOnly?: boolean;
}

/**
 * Reusable InputField component with Figma-based design
 *
 * @example
 * // Basic input with label
 * <InputField
 *   label="First Name"
 *   placeholder="First Name"
 *   value={firstName}
 *   onChange={(e) => setFirstName(e.target.value)}
 *   required
 * />
 *
 * @example
 * // Input with icon (for date fields)
 * <InputField
 *   label="Date of Birth"
 *   type="date"
 *   placeholder="mm-dd-yyyy"
 *   value={dob}
 *   onChange={(e) => setDob(e.target.value)}
 *   required
 * />
 */
const InputField: React.FC<InputFieldProps> = ({
  label,
  className = '',
  error,
  required = false,
  icon,
  id,
  labelClassName = '',
  type,
  onChange,
  value,
  alphaOnly = false,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
  const [inputValue, setInputValue] = useState<string>((value as string) || '');

  // Update input value when external value changes
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value as string);
    }
  }, [value]);

  // Handle input changes with special date formatting
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let rawValue = e.target.value;

    // Immediate sanitisation for alpha-only fields
    if (alphaOnly) {
      rawValue = rawValue.replace(/[^A-Za-z\s]/g, '');
    }

    setInputValue(rawValue);

    // Special handling for date inputs
    if (type === 'date' && rawValue && /^\d{8}$/.test(rawValue)) {
      const month = rawValue.substring(0, 2);
      const day = rawValue.substring(2, 4);
      const year = rawValue.substring(4, 8);

      const formattedDate = `${year}-${month}-${day}`;

      // If the date is valid, update and trigger callback
      if (isDateValid(formattedDate)) {
        const isoDate = formatISODate(formattedDate);
        setInputValue(isoDate);

        const newEvent = {
          ...e,
          target: {
            ...e.target,
            value: isoDate,
          },
        } as React.ChangeEvent<HTMLInputElement>;

        if (onChange) {
          onChange(newEvent);
        }

        return;
      }
    }

    // For standard input handling
    if (onChange) {
      // Clone event to inject possibly sanitised value
      const newEvent = {
        ...e,
        target: {
          ...e.target,
          value: rawValue,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(newEvent);
    }
  };

  return (
    <div className="relative w-full">
      {label && (
        <label
          htmlFor={inputId}
          className={`${labelClassName} block text-xs 2xl:text-sm text-secondary !mb-2`}
        >
          {label}
          {required && <span className="text-error-custom ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          className={`w-full min-w-[150px] h-[32px] lg:h-[40px] 2xl:h-[44px] px-5 border-input rounded-[32px] font-gotham-medium text-xs 2xl:text-base text-secondary placeholder:text-secondary placeholder:opacity-50 transition-all ${
            props.readOnly
              ? 'bg-[var(--input-bg)] cursor-default focus:outline-none'
              : 'bg-[var(--input-bg)] focus:outline-none focus:ring-2 focus-ring-primary focus-border-primary'
          } ${error ? 'border-error-custom' : ''} ${icon ? 'pr-12' : ''} ${className}`}
          type={type}
          value={inputValue}
          onChange={handleChange}
          {...(type === 'date' && { max: '9900-12-31', min: '1900-01-01' })}
          {...props}
        />
        {icon && (
          <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2 w-6 h-6">
            {icon}
          </div>
        )}
      </div>
      {error && <p className="text-error-custom text-xs mt-1 font-gotham-normal">{error}</p>}
    </div>
  );
};

export default InputField;

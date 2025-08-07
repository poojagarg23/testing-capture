import React from 'react';

interface TimeInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  className?: string;
  error?: string;
  required?: boolean;
  width?: string;
  height?: string;
}

/**
 * Reusable TimeInput component with consistent styling
 *
 * @example
 * // Basic time input
 * <TimeInput
 *   value={startTime}
 *   onChange={(e) => setStartTime(e.target.value)}
 * />
 *
 * @example
 * // Time input with label
 * <TimeInput
 *   label="Start Time"
 *   value={startTime}
 *   onChange={(e) => setStartTime(e.target.value)}
 *   required
 * />
 *
 * @example
 * // Custom width time input
 * <TimeInput
 *   value={endTime}
 *   onChange={(e) => setEndTime(e.target.value)}
 *   width="w-40"
 * />
 */
const TimeInput: React.FC<TimeInputProps> = ({
  label,
  className = '',
  error,
  required = false,
  width = 'w-32',
  height = 'h-10',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="relative">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs 2xl:text-sm font-gotham-medium text-secondary mb-2"
        >
          {label}
          {required && <span className="text-[#e5322e] ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        type="time"
        className={`${width} ${height} px-3 border border-[rgba(43,53,61,0.2)] rounded-full font-gotham-medium text-sm text-secondary bg-white focus:outline-none focus:ring-2 focus:ring-[#24A5DF] focus:border-[#24A5DF] transition-all ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1 font-gotham-normal">{error}</p>}
    </div>
  );
};

export default TimeInput;

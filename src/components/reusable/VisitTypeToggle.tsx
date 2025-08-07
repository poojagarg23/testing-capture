import React, { useState } from 'react';

interface VisitTypeToggleProps {
  value?: string | null;
  onChange?: (value: string) => void;
  required?: boolean;
  label?: string | React.ReactNode;
  labelClassName?: string;
}

const VisitTypeToggle: React.FC<VisitTypeToggleProps> = ({
  value = null,
  onChange,
  required = false,
  labelClassName = '',
  label = 'Visit Type',
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(value || 'Inpatient');

  // Keep internal state in sync with external prop changes
  React.useEffect(() => {
    if (value !== undefined && value !== null) {
      setSelectedOption(value);
    }
  }, [value]);

  const options = [
    { value: 'Inpatient', title: 'Inpatient' },
    { value: 'Consult', title: 'Consult' },
  ];

  const handleOptionClick = (optionValue: string) => {
    setSelectedOption(optionValue);
    if (onChange) {
      onChange(optionValue);
    }
  };

  return (
    <div className="w-full flex flex-col items-start gap-[5px]">
      <label className={`${labelClassName} block text-xs 2xl:text-sm text-secondary `}>
        {label} {required && <span className="text-error">*</span>}
      </label>
      <div className="p-1 rounded-full border border-subtle bg-[var(--input-bg)] grid grid-cols-2 gap-2 w-full">
        {options.map((option) => (
          <div
            key={option.title}
            className={`text-base font-gotham-medium py-2 px-4 2xl:py-2 2xl:px-7 rounded-full text-center flex justify-center items-center leading-[1.375] cursor-pointer transition-all duration-200 focus:outline-none
              ${
                selectedOption?.toLowerCase() === option.value.toLowerCase()
                  ? 'bg-primary-gradient text-white shadow-md'
                  : 'text-secondary hover:bg-[var(--table-hover)]'
              }`}
            onClick={() => handleOptionClick(option.value)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOptionClick(option.value);
              }
            }}
          >
            {option.title}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VisitTypeToggle;

import React, { useState } from 'react';

interface YesNoToggleProps {
  value?: boolean;
  onChange?: (value: boolean) => void;
  required?: boolean;
  label?: string | React.ReactNode;
  labelClassName?: string;
}

const YesNoToggle: React.FC<YesNoToggleProps> = ({
  value = true,
  onChange,
  required = false,
  labelClassName = '',
  label,
}) => {
  const [selectedOption, setSelectedOption] = useState<boolean>(value ?? true);
  const options = [
    { value: true, title: 'Yes' },
    { value: false, title: 'No' },
  ];

  const handleOptionClick = (optionValue: boolean) => {
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
            className={`text-base font-gotham-medium py-1 2xl:py-2 px-7 rounded-full text-center flex justify-center items-center leading-[1.375] cursor-pointer transition-all duration-200 focus:outline-none
              ${
                selectedOption === option.value
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

export default YesNoToggle;

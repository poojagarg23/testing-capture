import React, { useState } from 'react';

interface StatusToggleProps {
  value?: 'open' | 'resolved';
  onChange?: (value: 'open' | 'resolved') => void;
  required?: boolean;
  label?: string | React.ReactNode;
}

const StatusToggle: React.FC<StatusToggleProps> = ({
  value = 'open',
  onChange,
  required = false,
  label,
}) => {
  const [selectedOption, setSelectedOption] = useState<'open' | 'resolved'>(value);

  const options = [
    { value: 'open' as const, title: 'Open' },
    { value: 'resolved' as const, title: 'Resolved' },
  ];

  const handleClick = (val: 'open' | 'resolved') => {
    setSelectedOption(val);
    onChange?.(val);
  };

  return (
    <div className="w-full flex flex-col items-start gap-[5px]">
      <label className="block text-xs 2xl:text-sm text-secondary font-gotham-medium ">
        {label} {required && <span className="text-error">*</span>}
      </label>
      <div className="p-1 rounded-full border border-subtle bg-[var(--input-bg)] grid grid-cols-2 gap-2 w-full">
        {options.map((opt) => (
          <div
            key={opt.value}
            onClick={() => handleClick(opt.value)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleClick(opt.value);
              }
            }}
            className={`text-base font-gotham-medium py-2 2xl:py-2 px-7 rounded-full text-center flex justify-center items-center leading-[1.375] cursor-pointer transition-all duration-200 focus:outline-none ${
              selectedOption === opt.value
                ? 'bg-primary-gradient text-white shadow-md'
                : 'text-secondary hover:bg-[var(--table-hover)]'
            }`}
          >
            {opt.title}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatusToggle;

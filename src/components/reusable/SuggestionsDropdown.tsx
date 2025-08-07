import React from 'react';
import Dropdown from './custom/Dropdown.js';

interface SuggestionsDropdownProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

/**
 * SuggestionsDropdown component for feedback categories
 * 
 * @example
 * <SuggestionsDropdown
 *   value={category}
 *   onChange={setCategory}
 * />
 */
const SuggestionsDropdown: React.FC<SuggestionsDropdownProps> = ({
  value,
  onChange,
  className = ''
}) => {
  const options = [
    { label: 'Bug Report', value: 'bug' },
    { label: 'Feature Request', value: 'feature' },
    { label: 'General Feedback', value: 'general' },
    { label: 'Rehab Diagnosis', value: 'rehab-diagnosis' },
  ];

  return (
    <div className={`flex flex-col gap-3 lg:gap-1 ${className}`}>
      <label
        htmlFor="suggestions"
        className=" text-start text-sm 2xl:text-base pb-2 font-gotham-medium text-secondary"
      >
        Suggestions
      </label>
      <div className="w-full">
        <Dropdown
          options={options}
          value={value}
          onChange={(val) => onChange(val as string)}
          placeholder="Rehab Diagnosis"
          className='2xl:text-xl'
          buttonClassName='bg-white py-7 font-gotham-mediu 2xl:text-base 2xl:py-8 '
          textClassName='text-[rgba(0,0,0,0.3)]'
          maxWidth="100%"
        />
      </div>
    </div>
  );
    };

export default SuggestionsDropdown; 
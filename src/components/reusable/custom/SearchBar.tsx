import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search',
  icon,
  className = '',
}) => (
  <div
    className={`relative w-full max-w-[711px] h-[32px] lg:h-[40px] 2xl:h-[44px] font-gotham ${className}`}
  >
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-full pl-12 pr-4 rounded-full border-input bg-[var(--input-bg)] text-secondary text-[12px] font-medium placeholder:text-secondary placeholder:font-medium placeholder:text-left focus:outline-none focus:ring-2 focus-ring-primary not-italic"
      style={{
        opacity: 0.9,
      }}
    />
    {icon && (
      <span className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] flex items-center justify-center">
        {icon}
      </span>
    )}
  </div>
);

export default SearchBar;

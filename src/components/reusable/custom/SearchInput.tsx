import React from 'react';
import SearchIcon from '../../../assets/icons/search.svg?react';

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
}

/**
 * Reusable search input component based on Figma design
 *
 * Features:
 * - Rounded pill-shaped design (64px border radius)
 * - Built-in search icon positioned on the left
 * - Uses Gotham Medium font family
 * - Matches Figma specifications exactly
 * - Supports all standard input props
 *
 * @example
 * // Basic usage
 * <SearchInput
 *   placeholder="Search Directory"
 *   value={searchQuery}
 *   onChange={handleSearch}
 * />
 *
 * @example
 * // With custom styling
 * <SearchInput
 *   placeholder="Search patients..."
 *   value={query}
 *   onChange={setQuery}
 *   className="max-w-md"
 *   disabled={loading}
 * />
 */
const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = 'Search',
  value,
  onChange,
  className = '',
  disabled = false,
}) => {
  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        {/* Search Icon */}
        <div className="absolute left-3 sm:left-3 md:left-4 lg:left-4 xl:left-4 2xl:left-5 top-1/2 transform -translate-y-1/2 z-10">
          <SearchIcon
            className="w-[18px] h-[18px] sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 xl:w-6 xl:h-6 2xl:w-7 2xl:h-7 opacity-30"
            style={{ color: '#2b353d' }}
          />
        </div>

        {/* Input Field */}
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`
            w-full h-11 sm:h-11 md:h-13 lg:h-14 xl:h-14 2xl:h-16
            pl-10 sm:pl-10 md:pl-12 lg:pl-12 xl:pl-12 2xl:pl-16
            pr-4 sm:pr-4 md:pr-5 lg:pr-5 xl:pr-5 2xl:pr-6
            bg-white
            border border-[#726e6e]
            rounded-[64px]
            font-gotham-medium 
            text-xs sm:text-sm md:text-sm lg:text-base xl:text-base 2xl:text-lg
          
            focus:outline-none
            hover:border-gray-300
            disabled:opacity-[0.5] disabled:cursor-not-allowed
            transition-all duration-200
          `}
          style={{
            color: '#2b353d',
            borderColor: 'rgba(43, 53, 61, 0.1)',
          }}
          onFocus={(e) => {
            e.target.style.boxShadow = '0 0 0 2px rgba(36, 165, 223, 0.5)';
            e.target.style.borderColor = '#24a5df';
          }}
          onBlur={(e) => {
            e.target.style.boxShadow = 'none';
            e.target.style.borderColor = 'rgba(43, 53, 61, 0.1)';
          }}
        />
      </div>
    </div>
  );
};

export default SearchInput;

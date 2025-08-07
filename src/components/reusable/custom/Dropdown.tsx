import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Option {
  label: string;
  value: string | number;
  className?: string;
}

interface DropdownProps {
  options: Option[];
  value: string | number | (string | number)[];
  onChange: (val: string | number | (string | number)[]) => void;
  placeholder?: string;
  multiple?: boolean;
  className?: string;
  buttonClassName?: string;
  textClassName?: string;
  maxWidth?: string;
  fullWidth?: boolean;
  variant?: 'variant_1' | 'variant_2';
  disabled?: boolean;
  disableFocus?: boolean;
  optionClassName?: string;
  clampViewport?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder,
  multiple = false,
  className = '',
  buttonClassName = '',
  textClassName = '',
  maxWidth = '300px',
  fullWidth = false,
  variant = 'variant_2',
  disabled = false,
  disableFocus = false,
  optionClassName = '',
  clampViewport = false,
}) => {
  const [open, setOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Check if click is outside both the button container and the dropdown options
      if (
        ref.current &&
        !ref.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [open]);

  useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();

      const viewportMax = typeof window !== 'undefined' ? window.innerHeight * 0.5 : 384;
      const dropdownMaxHeight = Math.min(384, viewportMax);

      const optionsCount = options.length;
      const estimatedHeight = Math.min(optionsCount * 48 + 16, dropdownMaxHeight); // 48px per option + padding

      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Position above if there's not enough space below but enough space above
      const shouldPositionAbove =
        spaceBelow < estimatedHeight + 16 && spaceAbove > estimatedHeight + 16;

      let calculatedTop = shouldPositionAbove ? rect.top - estimatedHeight - 8 : rect.bottom + 8;
      let calculatedLeft = rect.left;

      if (clampViewport) {
        const padding = 8;

        const maxLeft = window.innerWidth - rect.width - padding;
        calculatedLeft = Math.min(calculatedLeft, maxLeft);
        calculatedLeft = Math.max(calculatedLeft, padding);

        const maxTop = window.innerHeight - estimatedHeight - padding;
        calculatedTop = Math.min(calculatedTop, maxTop);
        calculatedTop = Math.max(calculatedTop, padding);
      }

      setDropdownPosition({
        top: calculatedTop,
        left: calculatedLeft,
        width: rect.width,
      });
    }
  }, [open, options.length]);

  const isSelected = (val: string | number) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(val);
    }
    return value === val;
  };

  const handleSelect = (val: string | number) => {
    if (multiple) {
      if (Array.isArray(value)) {
        if (value.includes(val)) {
          onChange(value.filter((v) => v !== val));
        } else {
          onChange([...value, val]);
        }
      } else {
        onChange([val]);
      }
    } else {
      onChange(val);
      setOpen(false);
    }
  };

  const getDisplayText = () => {
    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return placeholder || 'Select options';
      if (value.length === 1) {
        return options.find((o) => o.value === value[0])?.label || '';
      }
      return `${value.length} selected`;
    }
    return options.find((o) => o.value === value)?.label || placeholder || 'Select option';
  };

  const getVariantStyles = () => {
    const commonFocus = !disableFocus
      ? 'focus:outline-none focus:ring-2 focus-ring-primary focus-border-primary'
      : '';

    if (variant === 'variant_1') {
      return {
        button: disabled
          ? 'h-8 lg:h-11 bg-subtle rounded-[64px] border-input px-4 text-[14px] cursor-default'
          : ` h-8 lg:h-11 bg-[var(--input-bg)] rounded-[64px] border-input px-4 text-[14px] ${commonFocus}`,
        arrow: 'right-4',
      } as const;
    }

    // variant_2 (default)
    return {
      button: disabled
        ? ' h-[32px] lg:h-[40px] 2xl:h-[44px] bg-subtle rounded-[32px] border-input px-5 text-sm 2xl:text-base cursor-default'
        : `h-[32px] lg:h-[40px] 2xl:h-[44px]  bg-white rounded-[32px] border-input px-5 text-sm 2xl:text-base ${commonFocus}`,
      arrow: 'right-5',
    } as const;
  };

  const variantStyles = getVariantStyles();

  // Clear selection when Backspace / Delete is pressed while the button is focused
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();

      if (multiple) {
        if (Array.isArray(value) && value.length > 0) {
          onChange([]);
        }
      } else {
        if (value !== '') {
          onChange('');
        }
      }
    }
  };

  return (
    <>
      <div
        ref={ref}
        className={`relative flex-1 min-w-[120px] ${fullWidth ? 'w-full' : ''} ${className}`}
        style={fullWidth ? {} : { maxWidth }}
        tabIndex={0}
      >
        <button
          ref={buttonRef}
          type="button"
          className={`relative w-full ${disabled ? 'cursor-default' : 'cursor-pointer'} ${variantStyles.button} flex-center-start text-secondary !bg-[var(--input-bg)] !border-input font-gotham-medium transition-all ${disabled ? '' : disableFocus ? '' : 'hover:bg-[var(--table-hover)]'} ${buttonClassName}`}
          onClick={() => !disabled && setOpen((o) => !o)}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
        >
          <span
            className={`truncate text-left  whitespace-nowrap pr-6 text-secondary ${textClassName}`}
          >
            {getDisplayText()}
          </span>
          <svg
            className={`absolute ${variantStyles.arrow} w-4 h-4 text-secondary transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed bg-white border-input rounded-2xl shadow-xl z-[9999] landscape-dropdown overflow-y-auto py-2"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              minWidth: dropdownPosition.width, // Ensure dropdown matches
              maxHeight: Math.min(
                384,
                typeof window !== 'undefined' ? window.innerHeight * 0.5 : 384,
              ),
            }}
          >
            {options.map((option) => (
              <div
                key={option.value}
                className={`px-4 py-3 flex-center-start cursor-pointer hover:bg-[var(--table-hover)] mx-2 my-1 rounded-lg transition-all font-gotham text-[14px] ${
                  isSelected(option.value)
                    ? 'bg-[var(--table-hover)] text-primary font-gotham-medium'
                    : 'text-secondary'
                } ${option.className || ''}`}
                onClick={() => handleSelect(option.value)}
                role="option"
                aria-selected={isSelected(option.value)}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleSelect(option.value);
                }}
              >
                {multiple && (
                  <div className="flex-center mr-3">
                    <div
                      className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                        isSelected(option.value)
                          ? 'bg-primary-blue border border-input-focus'
                          : 'border-input bg-[var(--input-bg)]'
                      }`}
                    >
                      {isSelected(option.value) && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                )}
                <span className={`truncate ${optionClassName}`}>{option.label}</span>
              </div>
            ))}
          </div>,
          document.body,
        )}
    </>
  );
};

export default Dropdown;

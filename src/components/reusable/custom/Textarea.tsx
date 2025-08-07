import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  className?: string;
  variant?: 'default' | 'large' | 'compact' | 'edit';
  error?: string;
  required?: boolean;
}

/**
 * Reusable Textarea component with consistent styling
 *
 * @example
 * // Default textarea with label
 * <Textarea
 *   label="Shortcut"
 *   placeholder="Enter shortcut"
 *   value={shortcut}
 *   onChange={(e) => setShortcut(e.target.value)}
 * />
 *
 * @example
 * // Large textarea for longer content
 * <Textarea
 *   label="Expansion"
 *   variant="large"
 *   placeholder="Enter expanded text"
 *   value={expansion}
 *   onChange={(e) => setExpansion(e.target.value)}
 * />
 *
 * @example
 * // Compact textarea without label
 * <Textarea
 *   variant="compact"
 *   placeholder="Quick note..."
 *   value={note}
 *   onChange={(e) => setNote(e.target.value)}
 * />
 */
const Textarea: React.FC<TextareaProps> = ({
  label,
  className = '',
  variant = 'default',
  error,
  required = false,
  id,
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'large':
        return 'h-24';
      case 'compact':
        return 'h-12';
      case 'edit':
        return 'min-h-[80px] bg-white';
      default:
        return 'h-12';
    }
  };

  const baseClasses =
    'w-full px-4 py-3 border-input rounded-2xl font-gotham-normal text-sm text-secondary resize-none !bg-[var(--input-bg)] focus:outline-none focus:ring-2 focus-ring-primary focus:border-transparent';

  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm 2xl:text-base pb-2 font-gotham-medium text-secondary"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`${baseClasses} ${getVariantClass()} ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1 font-gotham-normal">{error}</p>}
    </div>
  );
};

export default Textarea;

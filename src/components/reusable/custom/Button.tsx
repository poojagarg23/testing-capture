import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  childrenClassName?: string; // New prop for styling the button text
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'dark' | 'white' | 'success';
  icon?: string | React.ComponentType<React.SVGProps<SVGSVGElement>>; // SVG icon URL or React component
  size?: 'default' | 'small' | 'large';
  paddingLevel?: 1 | 2 | 3 | 4 | 5; // Horizontal padding levels
  loading?: boolean; // New prop for loading state
  loadingText?: string; // Custom loading text
}

/**
 * Reusable Button component with Figma-based designs
 *
 * @example
 * // Primary button (blue) with icon
 * <Button variant="primary" icon="/path/to/plus-icon.svg">
 *   Add Diagnosis
 * </Button>
 *
 * @example
 * // Secondary button (green) with icon
 * <Button variant="secondary" icon="/path/to/plus-icon.svg">
 *   New Admission
 * </Button>
 *
 * @example
 * // Button with loading state
 * <Button variant="primary" loading={isLoading} loadingText="Adding...">
 *   Add Expansion
 * </Button>
 *
 * @example
 * // Button with custom padding level
 * <Button variant="primary" paddingLevel={3}>
 *   Medium Padding Button
 * </Button>
 *
 * @example
 * // Custom styling with separate text styling
 * <Button variant="primary" className="w-full" childrenClassName="text-lg">
 *   Full Width Button with Large Text
 * </Button>
 */
const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  childrenClassName = '',
  variant = 'primary',
  icon,
  size = 'default',
  paddingLevel,
  loading = false,
  loadingText = 'Loading...',
  disabled,
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return 'btn-primary';
      case 'secondary':
        return 'btn-secondary';
      case 'tertiary':
        return 'btn-tertiary';
      case 'danger':
        return 'btn-tertiary';
      case 'dark':
        return 'btn-dark';
      case 'white':
        return 'btn-white text-secondary';
      case 'success':
        return 'btn-secondary';
      default:
        return 'btn-primary';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'landscape:text-[10px] text-xs px-2 py-1';
      case 'large':
        return 'landscape:text-sm text-lg px-6 py-4';
      default:
        return '';
    }
  };

  const getPaddingClass = () => {
    if (!paddingLevel) return 'px-3 py-2.5 lg:py-2.5 lg:py-3'; // Default 13px padding (12px is closest to 13px in Tailwind)

    switch (paddingLevel) {
      case 1:
        return 'px-2 py-2.5 lg:py-3'; // 8px horizontal, keep vertical
      case 2:
        return 'px-4 py-2.5 lg:py-3'; // 16px horizontal, keep vertical
      case 3:
        return 'px-6 py-2.5 lg:py-3'; // 24px horizontal, keep vertical
      case 4:
        return 'px-8 py-2.5 lg:py-3'; // 32px horizontal, keep vertical
      case 5:
        return 'px-12 py-2.5 lg:py-3'; // 48px horizontal, keep vertical
      default:
        return 'px-3 py-2.5 lg:py-3';
    }
  };

  const renderIcon = () => {
    if (loading) {
      return (
        <svg
          className="btn-icon animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      );
    }

    if (!icon) return null;

    if (typeof icon === 'string') {
      return <img src={icon} alt="" className="btn-icon" />;
    } else {
      const IconComponent = icon;
      return <IconComponent className="btn-icon" />;
    }
  };

  return (
    <button
      className={`${className} btn-base min-h-[27px] lg:min-h-[30px] 2xl:min-h-[44px] ${getVariantClass()} ${getSizeClass()} ${getPaddingClass()} ${
        loading || disabled ? 'opacity-40 cursor-not-allowed' : ''
      } overflow-hidden`}
      disabled={loading || disabled}
      {...props}
    >
      {renderIcon()}
      <span className={`landscape-text ${childrenClassName}`}>
        {loading ? loadingText : children}
      </span>
    </button>
  );
};

export default Button;

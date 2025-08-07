import React from 'react';
import { useNavigate } from 'react-router-dom';
import BackCircle from '../../../assets/icons/BackCircle.svg?react';
import BackArrow from '../../../assets/icons/BackArrow.svg?react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  backButtonClassName?: string;
}

/**
 * Reusable page header component with optional back button and subtitle
 *
 * @example
 * // Simple header with title only
 * <PageHeader title="MacroMate Clinical" />
 *
 * @example
 * // Header with back button (uses browser navigation)
 * <PageHeader
 *   title="Patient Details"
 *   showBackButton={true}
 * />
 *
 * @example
 * // Header with subtitle
 * <PageHeader
 *   title="Charges Review"
 *   subtitle="View a complete list of all previously billed charges, payment statuses, and service dates."
 *   showBackButton={true}
 * />
 *
 * @example
 * // Header with custom back action
 * <PageHeader
 *   title="Edit Profile"
 *   showBackButton={true}
 *   onBack={() => setEditMode(false)}
 * />
 *
 * @example
 * // Header with custom styling
 * <PageHeader
 *   title="Settings"
 *   showBackButton={true}
 *   className="border-b border-gray-200"
 *   titleClassName="text-primary text-xl"
 * />
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  onBack,
  className = '',
  titleClassName = '',
  subtitleClassName = '',
  backButtonClassName = '',
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  // Conditionally set alignment based on subtitle presence
  const alignmentClass = subtitle ? 'items-start' : 'items-center';

  return (
    <div className={`flex ${alignmentClass} gap-4 py-4 ${className}`}>
      {showBackButton && (
        <button
          onClick={handleBack}
          className={`relative w-10 h-10  2xl:w-12 2xl:h-12 flex-shrink-0 cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 ${backButtonClassName}`}
          type="button"
          aria-label="Go back"
        >
          <div className="absolute inset-0">
            <BackCircle className="block max-w-none size-full" />
          </div>
          <div className="absolute inset-1/4">
            <BackArrow className="block max-w-none size-full" />
          </div>
        </button>
      )}
      <div className="flex flex-col gap-1">
        <h1
          className={`font-gotham font-bold text-sm lg:text-base 2xl:text-lg text-secondary leading-normal ${titleClassName}`}
        >
          {title}
        </h1>
        {subtitle && (
          <div className={`text-sm text-muted font-gotham ${subtitleClassName}`}>{subtitle}</div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;

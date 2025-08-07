import React from 'react';
import OpenIcon from '../../../assets/icons/open.svg?react';

interface DirectoryCardProps {
  title?: string;
  description?: string;
  icon?: string | React.ComponentType<Record<string, unknown>>;
  iconProps?: Record<string, unknown>; // Props to pass to the icon component (e.g., stroke, fill, etc.)
  onReadMoreClick?: () => void;
  className?: string;
  iconBackgroundGradient?: string;
}

/**
 * DirectoryCard component with Figma-based design
 * A card component featuring an icon, title, description, and read more link
 *
 * @example
 * // Directory card (default)
 * <DirectoryCard />
 *
 * @example
 * // MacroMate Clinical card with white icon (default)
 * <DirectoryCard
 *   title="MacroMate Clinical"
 *   description="Access clinical documentation tools and templates..."
 *   icon={MacroMateClinicalIcon}
 *   iconBackgroundGradient="linear-gradient(45deg, rgb(168, 85, 247) 0%, rgb(147, 51, 234) 100%)"
 * />
 *
 * @example
 * // Charges card with white icon
 * <DirectoryCard
 *   title="Charges"
 *   description="Manage patient billing and financial information..."
 *   icon={ChargesIcon}
 *   iconBackgroundGradient="linear-gradient(45deg, rgb(34, 197, 94) 0%, rgb(22, 163, 74) 100%)"
 * />
 *
 * @example
 * // Patients card with custom icon props
 * <DirectoryCard
 *   title="Patient List"
 *   description="View and manage all patient records and information..."
 *   icon={PatientsIcon}
 *   iconProps={{ stroke: 'white', strokeWidth: 1.5 }}
 *   iconBackgroundGradient="linear-gradient(45deg, rgb(59, 130, 246) 0%, rgb(37, 99, 235) 100%)"
 *   onReadMoreClick={() => navigate('/patients')}
 * />
 *
 * @example
 * // Help card with SVG string icon (will be white by default when using React component)
 * <DirectoryCard
 *   title="Help & Support"
 *   description="Get assistance and find answers to common questions..."
 *   icon={HelpIcon}
 *   iconBackgroundGradient="linear-gradient(45deg, rgb(249, 115, 22) 0%, rgb(234, 88, 12) 100%)"
 *   readMoreText="Get help"
 * />
 */
const DirectoryCard: React.FC<DirectoryCardProps> = ({
  title = '',
  description = '',
  icon = '',
  iconProps = {},
  onReadMoreClick,
  className = '',
  iconBackgroundGradient = '',
}) => {
  const renderIcon = () => {
    if (!icon) return null;

    if (typeof icon === 'string') {
      return <img alt="" className="block max-w-none size-full" src={icon} />;
    } else {
      const IconComponent = icon;
      return <IconComponent className="block max-w-none size-full" {...iconProps} />;
    }
  };

  return (
    <div
      className={`bg-white relative border border-input rounded-2xl shadow-[var(--card-shadow-lg)] hover:shadow-[var(--card-shadow-lg-hover)] transition-shadow duration-300 w-full h-full cursor-pointer ${className}`}
      onClick={onReadMoreClick}
    >
      <div className="relative size-full">
        <div className="box-border flex flex-col gap-2.5 items-start justify-start p-[30px] relative size-full">
          <div className="box-border flex flex-col gap-5 items-start justify-start p-0 relative shrink-0 w-full">
            <div className="box-border flex flex-col gap-3.5 items-start justify-start p-0 relative shrink-0 w-full">
              {/* Icon Container */}
              <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
                <div
                  className="[grid-area:1_/_1] ml-0 mt-0 rounded-[7px] shadow-[0px_8px_16px_-4px_rgba(47,58,67,0.1)] size-10"
                  style={{
                    backgroundImage: iconBackgroundGradient,
                  }}
                />
                <div className="[grid-area:1_/_1] ml-2.5 mt-2.5 relative size-5">
                  {renderIcon()}
                </div>
              </div>

              {/* Title and Description */}
              <div className="box-border flex flex-col gap-[5px] items-start justify-start leading-[0] p-0 relative shrink-0 text-secondary text-left w-full">
                <div className="flex flex-col font-gotham-bold justify-center relative shrink-0 text-sm md:text-base lg:text-base 2xl:text-xl w-full">
                  <p className="block leading-tight font-bold">{title}</p>
                </div>
                <div className="font-gotham-normal opacity-60 relative shrink-0 text-xs md:text-xs 2xl:text-base w-full">
                  <p className="block font-normal leading-relaxed">{description}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-row items-center gap-2 font-gotham-bold justify-start leading-[0] relative shrink-0 text-secondary text-xs md:text-sm lg:text-base 2xl:text-lg text-left w-full">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onReadMoreClick?.();
                }}
                className="flex items-center gap-2 text-left decoration-solid leading-tight font-bold hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none p-0"
                type="button"
              >
                <OpenIcon
                  style={{ fill: 'var(--text-primary)' }}
                  className="icon-size-sm flex-shrink-0"
                />
                Open
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectoryCard;

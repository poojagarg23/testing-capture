import React from 'react';
import ToggleIcon from '../../../assets/icons/toggle.svg?react';
import TickToggleIcon from '../../../assets/icons/tick_toggle.svg?react';

interface ToggleButtonProps {
  checked: boolean;
  onChange: () => void;
  className?: string;
  title?: string;
  width?: string;
  height?: string;
  showIcon?: boolean;
  variant?: 'icon' | 'plain';
  toggleIconName?: 'default' | 'tick';
  colorVariant?: 'blue' | 'green';
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
  checked,
  onChange,
  className = '',
  title = 'Toggle Edit Mode',
  width = 'w-14',
  height = 'h-7',
  showIcon = true,
  variant = 'icon',
  toggleIconName = 'default',
  colorVariant = 'blue',
}) => {
  // Select icon based on toggleIconName prop
  const getIconComponent = () => {
    switch (toggleIconName) {
      case 'tick':
        return TickToggleIcon;
      case 'default':
      default:
        return ToggleIcon;
    }
  };

  // Select background color based on colorVariant prop using theme variables
  const getBackgroundColor = () => {
    if (checked) {
      switch (colorVariant) {
        case 'green':
          return 'bg-[var(--primary-green-dark)]'; // Uses theme green
        case 'blue':
        default:
          return 'bg-primary-gradient'; // Existing blue gradient utility
      }
    }
    // Unchecked state – subtle surface colour
    return 'bg-[var(--toggle-button-bg)] hover-bg-[var(--toggle-button-bg)] ';
  };

  // Get appropriate width based on color variant
  const getToggleWidth = () => {
    if (colorVariant === 'green') {
      return 'w-10'; // Smaller width for green variant to match Figma
    }
    return width; // Use provided width for other variants
  };

  // Get appropriate translation distance based on width
  const getTranslateDistance = () => {
    const toggleWidth = getToggleWidth();
    if (toggleWidth === 'w-10') {
      return checked ? 'translate-x-5' : 'translate-x-0'; // Moved more to the right corner
    } else if (toggleWidth === 'w-4') {
      return checked ? 'translate-x-1' : 'translate-x-0';
    } else {
      return checked ? 'translate-x-7' : 'translate-x-0'; // Default for w-14
    }
  };

  // Get appropriate icon size based on color variant
  const getIconSize = () => {
    if (colorVariant === 'green') {
      return 'w-4 h-4'; // Smaller icon for green variant to fit better
    }
    return 'w-6 h-6'; // Default icon size
  };

  const IconComponent = getIconComponent();
  const toggleWidth = getToggleWidth();
  const translateDistance = getTranslateDistance();
  const iconSize = getIconSize();

  return (
    <div className="relative flex items-center">
      <div
        onClick={onChange}
        className={`${toggleWidth} ${height} flex items-center rounded-full cursor-pointer transition-all duration-300 click-effect p-0.5 ${getBackgroundColor()} ${className}`}
        title={title}
      >
        {variant === 'plain' ? (
          <div
            className={`w-5 h-5 bg-[var(--input-bg)] border border-subtle rounded-full shadow-sm transform transition-transform duration-300 ${translateDistance}`}
          />
        ) : (
          <div className={`transform transition-transform duration-300 ${translateDistance}`}>
            {showIcon && <IconComponent className={iconSize} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default ToggleButton;

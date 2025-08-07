import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import LightIcon from '../../assets/icons/light.svg?react';
import DarkIcon from '../../assets/icons/dark.svg?react';

interface ThemeToggleProps {
  collapsed?: boolean;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ collapsed = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const INACTIVE_ICON_COLOR = 'var(--text-secondary)';

  return (
    <button
      onClick={toggleTheme}
      className={`relative outline-none border-none cursor-pointer font-gotham-bold  w-full py-6 text-secondary hover:text-primary transition-all group ${
        collapsed ? 'flex-center' : 'flex-center-start'
      }`}
    >
      <div className="hover-bg-overlay" />

      <div className={` relative icon-container ${collapsed ? '' : 'mr-4'}`}>
        {isDark ? (
          <LightIcon className="w-[18px] h-[18px]" style={{ color: INACTIVE_ICON_COLOR }} />
        ) : (
          <DarkIcon className="w-[18px] h-[18px]" style={{ color: INACTIVE_ICON_COLOR }} />
        )}
      </div>

      {!collapsed && (
        <span className="relative font-gotham-bold text-sidebar">
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;

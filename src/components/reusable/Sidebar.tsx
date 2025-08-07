import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getTokenFromLocalStorage, logout } from '../../helpers';
import Logo from '../../assets/images/logo1.png';
import LogoSingle from '../../assets/images/logo_single.png';

// Import icons as React components
import PatientsIcon from '../../assets/icons/profile-2user.svg?react';
import ChargesIcon from '../../assets/icons/wallet-money.svg?react';
import UtilitiesIcon from '../../assets/icons/category-2.svg?react';
import ProfileIcon from '../../assets/icons/profile-2user.svg?react';
import LogoutIcon from '../../assets/icons/logout.svg?react';

import ThemeToggle from './ThemeToggle';

// Icon colors derived from CSS variables for theming support
// Uses --text-secondary which is overridden in dark mode, and --text-white for consistency
const INACTIVE_ICON_COLOR = 'var(--text-secondary)';
const ACTIVE_ICON_COLOR = 'var(--text-white)';

const menuItems = [
  {
    key: 'Patients',
    label: 'Patients',
    icon: (active: boolean) => (
      <PatientsIcon
        className="w-[18px] h-[18px]"
        style={{ color: active ? ACTIVE_ICON_COLOR : INACTIVE_ICON_COLOR }}
      />
    ),
    route: '/patient-list',
  },
  {
    key: 'Charges',
    label: 'Charges',
    icon: (active: boolean) => (
      <ChargesIcon
        className="w-[18px] h-[18px]"
        style={{ color: active ? ACTIVE_ICON_COLOR : INACTIVE_ICON_COLOR }}
      />
    ),
    route: '/charges',
  },
  {
    key: 'Utilities',
    label: 'Utilities',
    icon: (active: boolean) => (
      <UtilitiesIcon
        className="w-[18px] h-[18px]"
        style={{ color: active ? ACTIVE_ICON_COLOR : INACTIVE_ICON_COLOR }}
      />
    ),
    route: '/utilities',
  },
  {
    key: 'Profile',
    label: 'Profile',
    icon: (active: boolean) => (
      <ProfileIcon
        className="w-[18px] h-[18px]"
        style={{ color: active ? ACTIVE_ICON_COLOR : INACTIVE_ICON_COLOR }}
      />
    ),
    route: '/profile',
  },
];

interface SideBarProps {
  open?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const SideBar = ({ open = false, onClose, collapsed = false, onToggleCollapse }: SideBarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('Patients');

  useEffect(() => {
    // Check for source context when on patient route
    if (location.pathname === '/patient' && location.state?.sourceContext === 'charges') {
      setActiveMenu('Charges');
    } else if (location.pathname === '/patient-list') {
      setActiveMenu('Patients');
    } else if (location.pathname === '/charges') {
      setActiveMenu('Charges');
    } else if (location.pathname.startsWith('/utilities')) {
      setActiveMenu('Utilities');
      // This will match /utilities and /utilities/macromate-clinical
    } else if (location.pathname.startsWith('/profile')) {
      setActiveMenu('Profile');
    } else {
      setActiveMenu('Patients');
    }
  }, [location.pathname, location.state]);

  // Prevent background scroll when sidebar is open on mobile
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (
    ['/', '/signin', '/signup', '/about', '/services', '/staff-users'].includes(location.pathname)
  )
    return null;
  if (getTokenFromLocalStorage() === null) return null;

  return (
    <>
      {/* Mobile/Tablet: Fullscreen overlay */}
      <aside
        className={`
          fixed top-0 left-0 landscape-aside h-full w-full z-50 bg-white flex flex-col shadow-lg transition-all duration-300 ease-in-out overflow-y-auto
          ${open ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
         lg:hidden
        `}
        style={{
          pointerEvents: open ? 'auto' : 'none',
          backgroundColor: 'white',
        }}
        aria-hidden={!open}
      >
        {/* Close button */}

        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex-center cursor-pointer sticky top-0 z-10 bg-white pt-6 pb-6">
            <img src={Logo} alt="Logo" className="h-[60px] w-auto" />
            <button
              className="absolute top-4 cursor-pointer  right-4 z-50 bg-gray-100 rounded-full p-1  shadow"
              onClick={onClose}
              aria-label="Close sidebar"
            >
              <svg
                className=" w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col px-8 flex-grow ">
            {menuItems.map((item, index) => {
              const isActive = activeMenu === item.key;
              return (
                <div key={item.key} className="relative">
                  {/* Separator line */}
                  {index > 0 && <div className="absolute top-0 left-0 right-0 h-px bg-subtle" />}

                  <button
                    onClick={() => {
                      setActiveMenu(item.key);
                      navigate(item.route);
                      if (onClose) onClose();
                    }}
                    className={`relative cursor-pointer flex-center-start w-full py-6 transition-all group ${
                      isActive ? 'text-white' : 'text-secondary hover:text-primary'
                    }`}
                  >
                    {/* Active background */}
                    {isActive && (
                      <div
                        className="absolute inset-0 bg-primary-gradient"
                        style={{ left: '-32px', right: '-32px' }}
                      />
                    )}

                    {/* Hover background */}
                    {!isActive && <div className="hover-bg-overlay" />}

                    {/* Icon container */}
                    <div className="relative icon-container mr-4">{item.icon(isActive)}</div>

                    {/* Label */}
                    <span className="relative  font-gotham-bold text-sidebar">{item.label}</span>
                  </button>
                </div>
              );
            })}
          </nav>

          {/* Theme toggle (Mobile) */}
          <div className="px-8 mb-4">
            <ThemeToggle collapsed={false} />
          </div>

          {/* Logout */}
          <div className="px-8 pb-8">
            <div className="relative">
              <button
                onClick={() => {
                  logout(navigate);
                  if (onClose) onClose();
                }}
                className={`relative cursor-pointer flex-center-start w-full py-6 transition-all group text-secondary hover:text-primary`}
              >
                {/* Hover background */}
                <div className="hover-bg-overlay" />
                <div className="relative icon-container mr-4">
                  <LogoutIcon
                    className="w-[18px] h-[18px]"
                    style={{ color: INACTIVE_ICON_COLOR }}
                  />
                </div>
                <span className="relative font-gotham-bold text-secondary">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Desktop: Fixed sidebar */}
      <aside
        className={`hidden lg:flex lg:flex-col h-full  lg:w-full lg:bg-white lg:border-r border-subtle  relative ${
          collapsed ? 'sidebar-collapsed' : ''
        }`}
      >
        {/* Collapse toggle button */}
        <button
          onClick={onToggleCollapse}
          className="absolute cursor-pointer top-4 right-[-12px] z-10 bg-white border border-subtle rounded-full p-1.5 shadow-sm hover:shadow-md transition-all duration-200"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            className={`w-4 h-4 text-secondary transition-transform duration-300 ${
              collapsed ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Logo */}
        <div className="flex-center pt-6 pb-6">
          <img
            src={collapsed ? LogoSingle : Logo}
            alt="Logo"
            className={`w-auto transition-all duration-300 ${collapsed ? 'h-[40px]' : 'h-[60px]'}`}
          />
        </div>

        {/* Navigation */}
        <div className="flex-grow flex flex-col justify-between overflow-y-auto">
          <div>
            <nav
              className={`flex flex-col flex-grow transition-all duration-300 ${
                collapsed ? 'px-3' : 'px-8'
              }`}
            >
              {menuItems.map((item, index) => {
                const isActive = activeMenu === item.key;
                return (
                  <div key={item.key} className="relative">
                    {/* Separator line */}
                    {index > 0 && <div className="absolute top-0 left-0 right-0 h-px bg-subtle" />}

                    <button
                      onClick={() => {
                        setActiveMenu(item.key);
                        navigate(item.route);
                      }}
                      className={`relative w-full cursor-pointer py-6 transition-all group ${
                        isActive ? 'text-white' : 'text-secondary hover:text-primary'
                      } ${collapsed ? 'flex-center' : 'flex-center-start'}`}
                      title={collapsed ? item.label : undefined}
                    >
                      {/* Active background */}
                      {isActive && (
                        <div
                          className="absolute inset-0 bg-primary-gradient"
                          style={{
                            left: collapsed ? '-12px' : '-32px',
                            right: collapsed ? '-12px' : '-32px',
                          }}
                        />
                      )}

                      {/* Hover background */}
                      {!isActive && <div className="hover-bg-overlay" />}

                      {/* Icon container */}
                      <div className={`relative icon-container ${collapsed ? '' : 'mr-4'}`}>
                        {item.icon(isActive)}
                      </div>

                      {/* Label - hidden when collapsed */}
                      {!collapsed && (
                        <span className="relative font-gotham-bold text-sidebar">{item.label}</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </nav>
          </div>
          <div>
            {/* Theme toggle (Desktop) */}
            <div className={` transition-all duration-300 ${collapsed ? 'px-3' : 'px-8'}`}>
              <ThemeToggle collapsed={collapsed} />
            </div>

            {/* Logout */}
            <div className={` transition-all duration-300 ${collapsed ? 'px-3' : 'px-8'}`}>
              <div className="relative">
                <button
                  onClick={() => logout(navigate)}
                  className={`relative cursor-pointer font-gotham-bold  w-full py-6 text-secondary hover:text-primary transition-all group ${
                    collapsed ? 'flex-center' : 'flex-center-start'
                  }`}
                  title={collapsed ? 'Logout' : undefined}
                >
                  {/* Hover background */}
                  <div className="hover-bg-overlay" />
                  <div className={`relative icon-container ${collapsed ? '' : 'mr-4'}`}>
                    <LogoutIcon
                      className="w-[18px] h-[18px]"
                      style={{ color: INACTIVE_ICON_COLOR }}
                    />
                  </div>
                  {!collapsed && (
                    <span className="relative font-gotham-bold text-secondary">Logout</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SideBar;

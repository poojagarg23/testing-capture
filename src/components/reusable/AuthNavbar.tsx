import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../../assets/images/logo_single.png';

export const AuthNavbar: React.FC = () => {
  const REACT_APP_HOME_DOMAIN: string = import.meta.env.VITE_HOME_DOMAIN as string;

  return (
    <>
      {/* Desktop Navbar */}
      <div className="hidden md:flex items-center justify-center px-6 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <img className="h-8 w-auto" src={logo} alt="Logo" />
          <NavLink
            to={REACT_APP_HOME_DOMAIN}
            className="font-gotham-medium text-base text-secondary hover:text-primary transition-colors"
          >
            Home
          </NavLink>
        </div>
      </div>

      {/* Mobile Navbar */}
      <div className="flex md:hidden items-center justify-center px-4 py-3 bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <img className="h-7 w-auto" src={logo} alt="Logo" />
          <NavLink
            to={REACT_APP_HOME_DOMAIN}
            className="font-gotham-medium text-base text-secondary hover:text-primary transition-colors"
          >
            Home
          </NavLink>
        </div>
      </div>
    </>
  );
};

export default AuthNavbar;

import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { getTokenFromLocalStorage } from './helpers';

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const accessToken = getTokenFromLocalStorage();
  return accessToken ? children : <Navigate to="/signin" replace />;
};

export default PrivateRoute;

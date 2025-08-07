import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTokenFromLocalStorage } from '../../helpers';

const Help: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const accessToken = getTokenFromLocalStorage();
    if (!accessToken) {
      navigate('/signin');
    }
  }, [navigate]);

  return <div>Help</div>;
};

export default Help;

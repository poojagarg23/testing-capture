import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { fetchUserDetails, ViewFacesheet } from '../../helpers';
import { UserData } from '../../types';

const Profile: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('Details');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getUserDetails();
  }, []);

  useEffect(() => {
    // Set active tab based on current route
    const path = location.pathname;
    if (path.includes('my-profile')) {
      setActiveTab('Details');
    } else if (path.includes('manage-absence')) {
      setActiveTab('Manage Absence');
    } else if (path.includes('security-privacy')) {
      setActiveTab('Security & Privacy');
    } else {
      setActiveTab('Details');
    }
  }, [location.pathname]);

  const getUserDetails = async () => {
    try {
      const data = await fetchUserDetails();
      setUserData(data);

      if (data.profile_pic) {
        const url = await ViewFacesheet(data.id, data.profile_pic);
        setProfilePicUrl(url);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    switch (tab) {
      case 'Details':
        navigate('/profile/my-profile');
        break;
      case 'Manage Absence':
        navigate('/profile/manage-absence');
        break;
      case 'Security & Privacy':
        navigate('/profile/security-privacy');
        break;
      default:
        navigate('/profile/my-profile');
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-2xl border-input card-shadow-lg px-4 sm:px-6 py-6 flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-subtle mb-6">
        <button
          onClick={() => handleTabChange('Details')}
          className={`tab-btn-base font-gotham-bold ${
            activeTab === 'Details' ? 'tab-btn-active' : 'tab-btn-inactive'
          }`}
        >
          Details
        </button>
        <button
          onClick={() => handleTabChange('Manage Absence')}
          className={`tab-btn-base font-gotham-bold ${
            activeTab === 'Manage Absence' ? 'tab-btn-active' : 'tab-btn-inactive'
          }`}
        >
          Manage Absence
        </button>
        <button
          onClick={() => handleTabChange('Security & Privacy')}
          className={`tab-btn-base font-gotham-bold ${
            activeTab === 'Security & Privacy' ? 'tab-btn-active' : 'tab-btn-inactive'
          }`}
        >
          Security & Privacy
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <Outlet
          context={{
            userData,
            profilePicUrl,
            getUserDetails,
          }}
        />
      </div>
    </div>
  );
};

export default Profile;

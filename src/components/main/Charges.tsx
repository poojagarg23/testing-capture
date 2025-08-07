import React, { useEffect, useState } from 'react';
import ChargesTab from '../single/ChargesTab.tsx';
import { useNavigate } from 'react-router-dom';
import SubmittedChargesHistory from '../single/SubmittedChargesHistory.tsx';
import ChargeReview from '../single/ChargeReview.tsx';
import { checkUserAccess } from '../../helpers';
import { getTokenFromLocalStorage } from '../../helpers/index.js';
import { ChargesTabType } from '../../types/Charges.types.ts';
import TransmittedCharges from '../single/TransmittedCharges.tsx';

const Charges: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ChargesTabType>('Charges');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const accessToken = getTokenFromLocalStorage();
    if (!accessToken) {
      navigate('/signin');
    }
    const res = checkUserAccess();
    setIsAdmin(res?.isAdmin ?? false);
  }, [navigate]);

  const handleTabChange = (tab: ChargesTabType) => {
    setActiveTab(tab);
  };

  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-lg px-3 sm:px-6  py-2 md:py-6 flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-subtle mb-2 lg:mb-6 overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-track-[var(--input-bg)] scrollbar-thumb-gray-400">
        <button
          onClick={() => handleTabChange('Charges')}
          className={`tab-btn-base font-gotham-bold ${
            activeTab === 'Charges' ? 'tab-btn-active' : 'tab-btn-inactive'
          }`}
        >
          Charges
        </button>
        <button
          onClick={() => handleTabChange('Charges History')}
          className={`tab-btn-base font-gotham-bold ${
            activeTab === 'Charges History' ? 'tab-btn-active' : 'tab-btn-inactive'
          }`}
        >
          Charges History
        </button>
        {isAdmin && (
          <button
            onClick={() => handleTabChange('Charge Review')}
            className={`tab-btn-base font-gotham-bold ${
              activeTab === 'Charge Review' ? 'tab-btn-active' : 'tab-btn-inactive'
            }`}
          >
            Charge Review
          </button>
        )}
        {isAdmin && (
          <button
            onClick={() => handleTabChange('Transmitted Charges')}
            className={`tab-btn-base font-gotham-bold ${
              activeTab === 'Transmitted Charges' ? 'tab-btn-active' : 'tab-btn-inactive'
            }`}
          >
            Transmitted Charges
          </button>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'Charges' && <ChargesTab />}
        {activeTab === 'Charges History' && <SubmittedChargesHistory />}
        {isAdmin && activeTab === 'Charge Review' && <ChargeReview />}
        {isAdmin && activeTab === 'Transmitted Charges' && <TransmittedCharges />}
      </div>
    </div>
  );
};

export default Charges;

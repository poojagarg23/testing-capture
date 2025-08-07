import React, { useState } from 'react';
import PageHeader from './custom/PageHeader';
import DispoConsultForm from './DispoConsult/DispoConsultForm';
import ExecutionLog from './DispoConsult/ExecutionLog';

const DispoConsult: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Dispo Consult' | 'Execution Log'>('Dispo Consult');

  return (
    <div className="w-full h-full bg-white rounded-2xl shadow-lg px-4 sm:px-6 py-0 md:py-6 flex flex-col">
      <PageHeader title="Dispo Consult" showBackButton={true} />

      <div className="flex gap-5 mb-8 mt-8 pl-5 border-b border-subtle">
        <button
          className={`tab-btn-base font-gotham-bold ${
            activeTab === 'Dispo Consult' ? 'tab-btn-active' : 'tab-btn-inactive'
          }`}
          onClick={() => setActiveTab('Dispo Consult')}
        >
          Dispo Consult
        </button>
        <button
          className={`tab-btn-base font-gotham-bold ${
            activeTab === 'Execution Log' ? 'tab-btn-active' : 'tab-btn-inactive'
          }`}
          onClick={() => setActiveTab('Execution Log')}
        >
          Execution Log
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        {activeTab === 'Dispo Consult' ? <DispoConsultForm /> : <ExecutionLog />}
      </div>
    </div>
  );
};

export default DispoConsult;

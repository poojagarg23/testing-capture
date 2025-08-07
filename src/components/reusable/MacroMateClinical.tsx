import React, { useState } from 'react';
import MacroMateMain from './MacroMateMain';
import PageHeader from './custom/PageHeader';

const MacroMateClinical: React.FC = () => {
  const [macroMateText, setMacroMateText] = useState<string>('');

  return (
    <div className="w-full h-full macro-height   bg-white rounded-2xl shadow-lg px-4 sm:px-6 py-3 md:py-6 flex flex-col">
      <PageHeader title="MacroMate Clinical" showBackButton={true} />
      <div className="flex-1 min-h-0 overflow-hidden">
        <MacroMateMain macroMateText={macroMateText} setText={setMacroMateText} />
      </div>
    </div>
  );
};

export default MacroMateClinical;

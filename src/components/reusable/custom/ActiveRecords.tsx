import React from 'react';

interface ActiveRecordsProps {
  count: number;
  className?: string;
  text?: string;
}

const ActiveRecords: React.FC<ActiveRecordsProps> = ({
  count,
  className = '',
  text = 'Active Records Available',
}) => (
  <div
    className={`text-sm text-right text-secondary font-gotham-normal ${className}`}
    style={{
      fontSize: '14px',
      lineHeight: '18px',
    }}
  >
    <span className="text-primary font-gotham-bold">{count.toString().padStart(2, '0')}</span>
    <span className="font-medium"> {text}</span>
  </div>
);

export default ActiveRecords;

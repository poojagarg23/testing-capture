import React from 'react';
import HoverContent from './HoverContent.tsx';
import type { Diagnosis } from '../../types/index.ts';

interface DiagnosisSummaryProps {
  diagnoses?: Diagnosis[] | null;
  /**
   * Maximum height for hover popup. Defaults to 200px
   */
  maxHeight?: string;
  /**
   * Position of hover popup. Defaults to "top"
   */
  position?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Displays the primary ICD-10 diagnosis code and description followed by
 * "+ X more" when additional secondary diagnoses exist. Hovering over the
 * text reveals a popup with the full, formatted list of diagnoses.
 */
const DiagnosisSummary: React.FC<DiagnosisSummaryProps> = ({
  diagnoses,
  maxHeight = '200px',
  position = 'top',
}) => {
  if (!diagnoses || diagnoses.length === 0) {
    return <span>-</span>;
  }

  // Ensure primary diagnosis is first in the list
  const sorted = [...diagnoses].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
  const primary = sorted[0];
  const secondary = sorted.slice(1);
  const secondaryCount = secondary.length;

  const hoverContent = (
    <div className="space-y-1">
      {sorted.map((d, idx) => (
        <div key={idx} className="text-xs whitespace-nowrap">
          {d.is_primary && <span className="text-error font-bold mr-0.5">*</span>}
          <span className="font-medium">{d.code}</span>
          {d.description && (
            <span className="text-[var(--text-secondary)]"> - {d.description}</span>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <HoverContent hoverContent={hoverContent} position={position} maxHeight={maxHeight}>
      <div className="leading-tight">
        {/* First line: primary code + X more */}
        <div>
          <span className="font-medium">{primary.code}</span>
          {secondaryCount > 0 && (
            <span className="text-[var(--text-secondary)]"> + {secondaryCount} more</span>
          )}
        </div>
        {/* Second line: description, truncated with ellipsis if overflow */}
        {primary.description && (
          <div className="text-[var(--text-secondary)] truncate max-w-[180px]">
            {primary.description}
          </div>
        )}
      </div>
    </HoverContent>
  );
};

export default DiagnosisSummary;

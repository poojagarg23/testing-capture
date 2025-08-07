import { useMemo } from 'react';
import Trash from '../../assets/icons/Trashicon.svg?react';
import TickPending from '../../assets/icons/tick_pending.svg?react';
import SelectedIcon from '../../assets/icons/GreenTick.svg?react';
import { VisitCode } from '../../types/index.ts';
import { VisitCodeProps } from '../../types/VisitCodeComponent.ts';

function VisitCodeComponent({
  visitCodes,
  selectedVisitCodes,
  handleChange,
  updateSelectedCode,
}: VisitCodeProps) {
  const categorizedCodes = useMemo(() => {
    return Array.isArray(visitCodes)
      ? visitCodes.reduce<Record<string, VisitCode[]>>((acc, code) => {
          if (!code.category) return acc;
          acc[code.category] = acc[code.category] || [];
          acc[code.category].push(code);
          return acc;
        }, {})
      : {};
  }, [visitCodes]);

  return (
    <div className="grid grid-cols-1 visit-code-container lg:grid-cols-2 gap-4 mb-3 w-full">
      {/* Available visit codes */}
      <div
        className="flex flex-col gap-2.5 bg-white rounded-xl  overflow-y-auto visit-code-list"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--text-muted-semi) transparent',
        }}
      >
        {Object.entries(categorizedCodes).map(([category, codes]) => (
          <div
            key={category}
            className="bg-white rounded-xl border border-input overflow-hidden flex-shrink-0"
          >
            <div
              className="px-3 py-3 text-white text-center font-bold text-xs"
              style={{ background: 'var(--figma-icon-gradient)', fontFamily: 'Gotham, sans-serif' }}
            >
              {category}
            </div>
            <div className="p-1 space-y-1">
              {codes.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <div className="flex-1 text-xs text-muted pr-2 font-gotham-normal">
                      <span className="text-secondary font-gotham-medium">{item.visit_code}:</span>{' '}
                      <span className="text-secondary">{item.description}</span>
                    </div>
                    <button
                      type="button"
                      className="p-0.5 cursor-pointer hover:scale-110 transition-transform"
                      onClick={() => {
                        const original = visitCodes.find((c) => c.id === item.id);
                        if (original) handleChange('visitCodes', original);
                      }}
                    >
                      {selectedVisitCodes.some((vc) => vc.visit_code === item.visit_code) ? (
                        <SelectedIcon width={20} height={20} />
                      ) : (
                        <TickPending width={20} height={20} fill="var(--text-muted)" />
                      )}
                    </button>
                  </div>
                  {index < codes.length - 1 && (
                    <div className="h-px mx-2" style={{ backgroundColor: 'var(--border-input)' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Selected visit codes */}
      <div className="bg-white rounded-xl visit-code-list border border-subtle overflow-hidden flex flex-col">
        <div
          className="px-3 py-2 min-h-[42px] visit-code-header text-white font-bold text-xs flex items-center justify-between flex-shrink-0"
          style={{ background: 'var(--figma-icon-gradient)', fontFamily: 'Gotham, sans-serif' }}
        >
          <span>Selected Visit Codes</span>
          {selectedVisitCodes.length > 0 && (
            <button
              type="button"
              className="w-7 h-7  bg-red-500 cursor-pointer rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              onClick={() => {
                selectedVisitCodes.forEach((vc) => updateSelectedCode('visitCodes', vc));
              }}
            >
              <Trash width={15} height={15} fill="var(--text-white)" />
            </button>
          )}
        </div>

        <div
          className="flex-1 p-1 space-y-1 overflow-y-auto"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--text-muted-semi) transparent' }}
        >
          {selectedVisitCodes.map((item, index) => (
            <div key={index}>
              <div className="flex items-center justify-between px-2 py-1.5">
                <div className="flex-1 text-xs text-muted pr-2 font-gotham-normal">
                  <span className="text-secondary font-gotham-medium">{item.visit_code}:</span>{' '}
                  <span className="text-secondary">{item.description}</span>
                </div>
                <button
                  type="button"
                  className="w-7 h-7  bg-red-500 cursor-pointer rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  onClick={() => updateSelectedCode('visitCodes', item)}
                >
                  <Trash width={15} height={15} fill="var(--text-white)" />
                </button>
              </div>
              {index < selectedVisitCodes.length - 1 && (
                <div className="h-px mx-2" style={{ backgroundColor: 'var(--border-input)' }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VisitCodeComponent;

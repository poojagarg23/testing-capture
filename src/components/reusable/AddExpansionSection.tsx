import React, { ChangeEvent, FormEvent } from 'react';
import DownArrow from '../../assets/icons/down-arrow-half.svg?react';
import Button from './custom/Button';
import Textarea from './custom/Textarea';

interface AddExpansionSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  shortcut: string;
  expandedText: string;
  onShortcutChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onExpandedTextChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onAddExpansion: (e: FormEvent) => void;
  onImport: () => void;
  addExpansionLoading: boolean;
  importLoading: boolean;
}

/**
 * Add New Expansion section component with collapsible form
 *
 * @example
 * <AddExpansionSection
 *   isOpen={addExpansionsOpen}
 *   onToggle={() => setAddExpansionsOpen(!addExpansionsOpen)}
 *   shortcut={shortcut}
 *   expandedText={expandedText}
 *   onShortcutChange={(e) => setShortcut(e.target.value)}
 *   onExpandedTextChange={(e) => setExpandedText(e.target.value)}
 *   onAddExpansion={handleAddExpansion}
 *   onImport={handleImport}
 *   addExpansionLoading={addExpansionLoading}
 *   importLoading={loading}
 * />
 */
const AddExpansionSection: React.FC<AddExpansionSectionProps> = ({
  isOpen,
  onToggle,
  shortcut,
  expandedText,
  onShortcutChange,
  onExpandedTextChange,
  onAddExpansion,
  onImport,
  addExpansionLoading,
  importLoading,
}) => {
  return (
    <div className="bg-white border-input rounded-2xl card-shadow-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center hover:bg-[var(--table-hover)] justify-between  transition-colors cursor-pointer outline-none"
        type="button"
      >
        <span className="font-gotham-bold text-sm sm:text-base text-secondary">
          Add New Expansion
        </span>
        <DownArrow
          className={`w-3 h-3 text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-subtle">
          <div className="pt-3 sm:pt-4 space-y-3 sm:space-y-4">
            <Textarea
              label="Shortcut"
              variant="compact"
              onChange={onShortcutChange}
              value={shortcut}
              id="shortcut"
              placeholder="Shortcut"
            />

            <Textarea
              label="Expansion"
              variant="large"
              onChange={onExpandedTextChange}
              value={expandedText}
              id="expansion"
              placeholder="Expanded text"
            />

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
              <Button
                onClick={onAddExpansion}
                variant="primary"
                loading={addExpansionLoading}
                loadingText="Adding..."
                className="w-full sm:w-auto"
              >
                Add Expansion
              </Button>
              <Button
                onClick={onImport}
                variant="dark"
                loading={importLoading}
                loadingText="Importing..."
                className="w-full sm:w-auto"
              >
                Import Expansions
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddExpansionSection;

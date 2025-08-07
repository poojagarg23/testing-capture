import React, { ChangeEvent } from 'react';
import DownArrow from '../../assets/icons/down-arrow-half.svg?react';
import Button from './custom/Button';
import ExpansionItem from './ExpansionItem';

interface Expansion {
  id: string;
  shortcut: string;
  expansion: string;
}

interface CurrentExpansionsSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  expansions: Expansion[];
  editingId: string;
  editText: string;
  onSort: () => void;
  onExport: () => void;
  onEdit: (id: string, expansion: string) => void;
  onSave: (shortcut: string, expandedText: string) => void;
  onCancel: () => void;
  onTextChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  loading?: boolean;
}

/**
 * Current Expansions section component with collapsible list
 *
 * @example
 * <CurrentExpansionsSection
 *   isOpen={expansionsOpen}
 *   onToggle={() => setExpansionsOpen(!expansionsOpen)}
 *   expansions={renderExpansionData}
 *   editingId={editingId}
 *   editText={listExpandedText}
 *   loading={editLoading}
 *   onSort={handleSort}
 *   onExport={handleExport}
 *   onEdit={(id, expansion) => {
 *     setEditingId(id);
 *     setListExpandedText(expansion);
 *   }}
 *   onSave={(shortcut, text) => {
 *     handleEditExpansion(shortcut, text);
 *     setListExpandedText('');
 *   }}
 *   onCancel={() => {
 *     setEditingId('');
 *     setListExpandedText('');
 *   }}
 *   onTextChange={handleListExpandedTextChange}
 * />
 */
const CurrentExpansionsSection: React.FC<CurrentExpansionsSectionProps> = ({
  isOpen,
  onToggle,
  expansions,
  editingId,
  editText,
  onSort,
  onExport,
  onEdit,
  onSave,
  onCancel,
  onTextChange,
  loading = false,
}) => {
  return (
    <div className="bg-white border-input rounded-2xl card-shadow-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center hover:bg-[var(--table-hover)] justify-between  transition-colors cursor-pointer outline-none"
        type="button"
      >
        <span className="font-gotham-bold text-sm sm:text-base text-secondary">
          Current Expansions
        </span>
        <DownArrow
          className={`w-3 h-3 text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-subtle">
          <div className="pt-3 sm:pt-4 space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button onClick={onSort} variant="primary" className="w-full sm:w-auto">
                Sort Alphabetically
              </Button>
              <Button onClick={onExport} variant="dark" className="w-full sm:w-auto">
                Export Expansions
              </Button>
            </div>

            <div className="space-y-3 sm:space-y-4 max-h-40 sm:max-h-48 md:max-h-56 lg:max-h-64 xl:max-h-64 overflow-y-auto">
              {expansions.map((item) => (
                <ExpansionItem
                  key={item.id}
                  item={item}
                  isEditing={editingId === item.id}
                  editText={editText}
                  onEdit={() => onEdit(item.id, item.expansion)}
                  onSave={() => onSave(item.shortcut, editText)}
                  onCancel={onCancel}
                  onTextChange={onTextChange}
                  loading={loading}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentExpansionsSection;

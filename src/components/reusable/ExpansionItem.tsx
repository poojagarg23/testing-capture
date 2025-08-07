import React, { ChangeEvent } from 'react';
import EditIcon from '../../assets/icons/edit.svg?react';
import Button from './custom/Button';
import Textarea from './custom/Textarea';

interface ExpansionItemProps {
  item: {
    id: string;
    shortcut: string;
    expansion: string;
  };
  isEditing: boolean;
  editText: string;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onTextChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  loading?: boolean;
}

/**
 * Individual expansion item component with view and edit states
 *
 * @example
 * <ExpansionItem
 *   item={expansionItem}
 *   isEditing={editingId === item.id}
 *   editText={listExpandedText}
 *   loading={saveLoading}
 *   onEdit={() => {
 *     setEditingId(item.id);
 *     setListExpandedText(item.expansion);
 *   }}
 *   onSave={() => {
 *     handleEditExpansion(item.shortcut, listExpandedText);
 *     setListExpandedText('');
 *   }}
 *   onCancel={() => {
 *     setEditingId('');
 *     setListExpandedText('');
 *   }}
 *   onTextChange={handleListExpandedTextChange}
 * />
 */
const ExpansionItem: React.FC<ExpansionItemProps> = ({
  item,
  isEditing,
  editText,
  onEdit,
  onSave,
  onCancel,
  onTextChange,
  loading = false,
}) => {
  return (
    <div className="p-4 sm:p-6 bg-[var(--macro-card)] rounded-2xl">
      {!isEditing ? (
        <>
          {/* Non-edit state */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0">
            <div className="flex-1 min-w-0">
              <div className="mb-3">
                <label
                  htmlFor="shortcut"
                  className="block text-xs pb-0.5 sm:pb-1 opacity-[0.6] font-gotham-bold text-secondary"
                >
                  Shortcut
                </label>
                <div className="font-gotham-bold text-sm sm:text-base text-secondary break-words">
                  {item.shortcut}
                </div>
              </div>

              <div>
                <label
                  htmlFor="Expansion"
                  className="block text-xs pb-0.5 sm:pb-1 opacity-[0.6] font-gotham-bold text-secondary"
                >
                  Expansion
                </label>
                <p
                  className="font-gotham-normal text-sm text-secondary leading-relaxed break-words whitespace-pre-wrap"
                  style={{ wordBreak: 'break-all' }}
                >
                  {item.expansion}
                </p>
              </div>
            </div>

            <div className="sm:ml-4 flex-shrink-0">
              <button
                onClick={onEdit}
                className="flex-center-start cursor-pointer gap-2 text-primary font-gotham-bold text-sm hover:opacity-80 transition-colors"
                type="button"
              >
                <EditIcon className="w-4 h-4 fill-current" />
                Edit
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Edit state - matches Figma exactly */}
          <div className="space-y-4">
            <div>
              <div className="text-xs font-gotham-normal text-muted mb-1">Shortcut</div>
              <div className="font-gotham-bold text-base text-secondary">{item.shortcut}</div>
            </div>

            <Textarea
              label="Expansion"
              variant="edit"
              onChange={onTextChange}
              value={editText}
              placeholder="Enter expansion text..."
              className="[&>label]:text-xs [&>label]:font-gotham-normal [&>label]:text-muted [&>label]:mb-1 [&>label]:pb-0"
            />

            {/* Save and Cancel buttons at bottom - matching Figma */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
              <Button
                className="w-full sm:w-auto !px-6 sm:!px-8"
                onClick={onSave}
                variant="primary"
                loading={loading}
                loadingText="Saving..."
              >
                Save
              </Button>
              <Button className="w-full sm:w-auto !px-6 sm:!px-8" onClick={onCancel} variant="dark">
                Cancel
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExpansionItem;

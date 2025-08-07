import React from 'react';
import { ConfirmationModalProps } from '../../types/ConfirmationModal.types.ts';
import Button from './custom/Button.tsx';
import Cross from '../../assets/icons/facesheet_cross.svg?react';

/**
 * A lightweight confirmation modal built with TailwindCSS utilities.
 * Relies on global button utility classes (`btn-primary`, `btn-white`, `btn-base`) defined in index.css.
 */
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  title = 'Confirm',
  message,
  icon,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  hideCancelButton = false,
  closeOnOutsideClick = false,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-lg rounded-xl bg-white dark:bg-surface-bg px-6 py-8 shadow-xl animate-fadeIn">
        {/* Close button */}
        {!hideCancelButton && (
          <button
            onClick={onClose}
            className="absolute right-3 top-3 p-2 rounded-full hover:bg-[var(--table-hover)] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus-ring-primary focus-border-primary"
            aria-label="Close modal"
            type="button"
          >
            <Cross className="w-4 h-4" style={{ fill: 'var(--text-secondary)' }} />
          </button>
        )}
        {/* Header */}
        <div className="mb-6 flex items-start gap-3">
          {icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-blue/10">
              {icon}
            </div>
          )}
          <div>
            <h2 className="font-gotham-bold text-base text-secondary mb-1">{title}</h2>
            {message && <p className="font-gotham text-sm text-muted">{message}</p>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-end gap-3">
          {!hideCancelButton && (
            <Button type="button" variant="white" className="border" onClick={onClose}>
              {cancelText}
            </Button>
          )}
          <Button type="button" variant="primary" onClick={onConfirm} disabled={hideCancelButton}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;

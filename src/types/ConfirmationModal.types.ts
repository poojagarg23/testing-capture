import { ReactNode } from 'react';

export interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  icon?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  hideCancelButton?: boolean;
  closeOnOutsideClick?: boolean;
}

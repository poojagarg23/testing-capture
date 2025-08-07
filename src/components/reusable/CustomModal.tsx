import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import ReactDOM from 'react-dom';
import Cross from '../../assets/icons/facesheet_cross.svg?react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  className?: string;
  useFixedWidth?: boolean;
  extraWide?: boolean;
}

const CustomModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  useFixedWidth = false,
  extraWide = false,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to ensure the modal is rendered before animation starts
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Wait for animation to complete before hiding
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown, isOpen]);

  if (!isVisible) return null;

  // Determine width classes based on props
  const widthClasses = extraWide
    ? 'w-auto lg:max-w-6xl 2xl:w-[1000px]'
    : useFixedWidth
      ? 'w-[600px]'
      : 'w-auto max-w-7xl';

  const modalMarkup = (
    <div
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`bg-white overflow-y-auto rounded-2xl shadow-2xl ${widthClasses} max-h-[calc(100vh-2rem)] mx-4 flex flex-col transition-all duration-300 ease-out ${
          isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        } ${className || ''}`}
      >
        {/* Fixed Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center justify-between px-6 py-4 border-b border-subtle">
            {title && (
              <h2 className="text-xl font-semibold text-secondary truncate pr-4 font-gotham">
                {title}
              </h2>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--table-hover)] rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus-ring-primary focus-border-primary"
              aria-label="Close modal"
            >
              <Cross className="w-4 h-4" style={{ fill: 'var(--text-secondary)' }} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalMarkup, document.body);
};

export default CustomModal;

import React from 'react';
import AttachIcon from '../../assets/icons/attach.svg?react';
import CloseIcon from '../../assets/icons/close.svg?react';
import Loader from './Loader';

interface FileAttachmentProps {
  file: File;
  onRemove: () => void;
  loading?: boolean;
  className?: string;
}

/**
 * FileAttachment component to display attached files
 *
 * @example
 * <FileAttachment
 *   file={selectedFile}
 *   onRemove={() => setSelectedFile(null)}
 * />
 */
const FileAttachment: React.FC<FileAttachmentProps> = ({
  file,
  onRemove,
  loading = false,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center justify-between !bg-[var(--input-bg)] border border-subtle rounded-[64px] h-[52px] lg:h-[60px] px-2 lg:px-3 ${className}`}
    >
      <div className="flex items-center gap-3 lg:gap-4">
        {/* Dark circular icon container */}
        <div className="w-9 h-9 figma-dark-bg rounded-full flex items-center justify-center">
          <AttachIcon className="w-4 h-4   text-white" />
        </div>
        <span className="font-gotham-medium break-words max-w-[200px] 2xl:max-w-[300px] text-sm lg:text-sm text-secondary">
          [{file.name}]
        </span>
      </div>
      {/* Error-color circular close button or loader */}
      <button
        onClick={loading ? undefined : onRemove}
        disabled={loading}
        className="w-9 h-9 bg-error-custom hover:opacity-90 disabled:opacity-60 rounded-full flex items-center justify-center transition-colors"
        aria-label="Remove file"
      >
        {loading ? (
          <Loader size="sm" color="#ffffff" />
        ) : (
          <CloseIcon
            className="w-4 cursor-pointer h-4  "
            style={{ color: 'white', fill: 'white', stroke: 'white' }}
          />
        )}
      </button>
    </div>
  );
};

export default FileAttachment;

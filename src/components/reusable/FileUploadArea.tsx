import React, { useRef } from 'react';
import { toast } from 'react-toastify';
import UploadIcon from '../../assets/images/upload.png';
import { TOAST_CONFIG } from '../../constants';

interface FileUploadAreaProps {
  onFileSelect: (file: File) => void;
  dragActive: boolean;
  onDragStateChange: (active: boolean) => void;
  className?: string;
  /**
   * Comma-separated list of MIME types or file extensions that the
   * underlying <input> should accept. Defaults to images and PDFs.
   */
  accept?: string;
  /** Allow the user to pick multiple files at once (default: false) */
  multiple?: boolean;
}

/**
 * FileUploadArea component with drag-and-drop functionality
 *
 * @example
 * <FileUploadArea
 *   onFileSelect={setImage}
 *   dragActive={dragActive}
 *   onDragStateChange={setDragActive}
 * />
 */
const FileUploadArea: React.FC<FileUploadAreaProps> = ({
  onFileSelect,
  dragActive,
  onDragStateChange,
  className = '',
  accept = 'image/*,application/pdf',
  multiple = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      onDragStateChange(true);
    } else if (e.type === 'dragleave') {
      onDragStateChange(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDragStateChange(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      Array.from(e.dataTransfer.files).forEach((file) => {
        if (file.type.startsWith('image/') || file.type === 'application/pdf') {
          onFileSelect(file);
        } else {
          toast.error('Please upload an image or PDF file', TOAST_CONFIG.ERROR);
        }
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach((file) => {
        if (file.type.startsWith('image/') || file.type === 'application/pdf') {
          onFileSelect(file);
        } else {
          toast.error('Please upload an image or PDF file', TOAST_CONFIG.ERROR);
        }
      });
    }
    // Clear the input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`flex flex-col gap-3 border-2 !bg-[var(--input-bg)] border-subtle rounded-2xl lg:gap-4 ${className}`}
    >
      <div
        className={`relative w-full h-[170px] lg:h-[200px] 2xl:h-[240px]  !bg-[var(--input-bg)] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-colors cursor-pointer ${
          dragActive
            ? 'border-[var(--primary-blue)]'
            : 'border-subtle hover:border-[var(--primary-blue)]'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        {/* Upload Icon */}
        <div className="mb-4 lg:mb-6">
          <div className="w-[146px] lg:w-[160px] 2xl:w-[250px] h-[130px] lg:h-[140px] 2xl:h-[180px] flex flex-col items-center justify-center">
            <div className="w-12 h-12 lg:w-14 lg:h-14 2xl:w-20 2xl:h-20 mb-4 lg:mb-6">
              <img src={UploadIcon} alt="Upload" className="w-full h-full" />
            </div>
            <div className="text-center">
              <p className="font-gotham-medium text-xs lg:text-sm 2xl:text-base text-secondary">
                <span>Drag a file here or </span>
              </p>
              <p className="font-gotham-medium text-xs lg:text-sm  text-secondary">
                <span className="text-primary underline cursor-pointer">upload from device.</span>
              </p>
            </div>
          </div>
        </div>

        <input
          type="file"
          accept={accept}
          multiple={multiple}
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default FileUploadArea;

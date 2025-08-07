import React, { useState } from 'react';
import CustomModal from './CustomModal';
import InputField from './custom/InputField';
import Button from './custom/Button';
import PasswordEyeIcon from '../../assets/icons/input-field-password-eye.svg?react';
import EyeIcon from '../../assets/icons/eyeclose.svg?react';

interface AccessPasswordModalProps {
  isOpen: boolean;
  onSubmit: (password: string) => void;
  onClose: () => void;
}

const AccessPasswordModal: React.FC<AccessPasswordModalProps> = ({ isOpen, onSubmit, onClose }) => {
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSubmit = () => {
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    onSubmit(password);
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title="Enter Access Password" useFixedWidth>
      <div className="space-y-6">
        <InputField
          label="Access Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          error={error}
          required
          icon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="w-full cursor-pointer h-full flex items-center justify-center hover:opacity-70 transition-opacity"
            >
              {showPassword ? (
                <EyeIcon className="w-5 h-5 text-[var(--text-primary)]" />
              ) : (
                <PasswordEyeIcon className="w-5 h-5 text-[var(--text-primary)]" />
              )}
            </button>
          }
        />
        <div className="flex justify-end gap-4">
          <Button variant="white" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </div>
    </CustomModal>
  );
};

export default AccessPasswordModal;

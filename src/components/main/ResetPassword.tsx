import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../../helpers/reset-password';
import { ResetPasswordErrors } from '../../types/ResetPassword.types.ts';
import InputField from '../reusable/custom/InputField';
import Button from '../reusable/custom/Button';
import PasswordEyeIcon from '../../assets/icons/input-field-password-eye.svg?react';
import EyeIcon from '../../assets/icons/eyeclose.svg?react';
import AuthNavbar from '../reusable/AuthNavbar';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<ResetPasswordErrors>({});

  const isPasswordValid = (password: string): boolean => {
    return password.length >= 6 && /\d/.test(password) && /[a-zA-Z]/.test(password);
  };

  const handleResetPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors: ResetPasswordErrors = {};

    if (!newPassword) {
      validationErrors.newPassword = '*Password is required';
    } else if (!isPasswordValid(newPassword)) {
      validationErrors.newPassword =
        '*Password must be at least 6 characters long and contain both digits and letters';
    }

    if (newPassword !== confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    await resetPassword(token, newPassword, navigate);
    setLoading(false);
  };

  const handleNewPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);

    if (!value) {
      setErrors((prev) => ({ ...prev, newPassword: '*Password is required' }));
    } else if (!isPasswordValid(value)) {
      setErrors((prev) => ({
        ...prev,
        newPassword:
          '*Password must be at least 6 characters long and contain both digits and letters',
      }));
    } else {
      setErrors((prev) => {
        const updatedErrors = { ...prev };
        delete updatedErrors.newPassword;
        return updatedErrors;
      });
    }

    if (confirmPassword && value !== confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
    } else if (confirmPassword) {
      setErrors((prev) => {
        const updatedErrors = { ...prev };
        delete updatedErrors.confirmPassword;
        return updatedErrors;
      });
    }
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);

    if (newPassword !== value) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
    } else {
      setErrors((prev) => {
        const updatedErrors = { ...prev };
        delete updatedErrors.confirmPassword;
        return updatedErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-main">
      <AuthNavbar />
      <div className="flex items-start lg:items-center justify-center p-4 min-h-[calc(100vh-80px)]">
        <div className="bg-white rounded-3xl shadow-[0px_16px_32px_-8px_rgba(0,0,0,0.05)] w-full max-w-[520px] p-10">
          <form onSubmit={handleResetPassword} className="space-y-6">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="font-gotham-bold text-2xl text-secondary mb-2">Reset Password</h1>
              <p className="font-gotham text-sm text-secondary opacity-60 leading-5">
                Enter your new password below to reset your account password.
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <InputField
                label="New Password"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={newPassword}
                onChange={handleNewPasswordChange}
                error={errors.newPassword}
                className="w-full"
                icon={
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="w-full h-full flex items-center justify-center hover:opacity-70 transition-opacity"
                  >
                    {showNewPassword ? (
                      <EyeIcon className="w-5 h-5 text-[var(--text-primary)]" />
                    ) : (
                      <PasswordEyeIcon className="w-5 h-5 text-[var(--text-primary)]" />
                    )}
                  </button>
                }
              />

              <InputField
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={handleConfirmPasswordChange}
                error={errors.confirmPassword}
                className="w-full"
                icon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="w-full cursor-pointer h-full flex items-center justify-center hover:opacity-70 transition-opacity"
                  >
                    {showConfirmPassword ? (
                      <EyeIcon className="w-5 h-5 text-[var(--text-primary)]" />
                    ) : (
                      <PasswordEyeIcon className="w-5 h-5 text-[var(--text-primary)]" />
                    )}
                  </button>
                }
              />
            </div>

            {/* Submit Button */}
            <Button
              variant="primary"
              type="submit"
              loading={loading}
              loadingText="Resetting..."
              className="w-full h-[52px] rounded-[50px] font-gotham-bold text-sm"
            >
              Reset Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

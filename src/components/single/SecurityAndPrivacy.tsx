import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import InputField from '../reusable/custom/InputField';
import ToggleButton from '../reusable/custom/ToggleButton';
import Button from '../reusable/custom/Button';
import TimeInput from '../reusable/custom/TimeInput';
import { OutletContextType } from '../../types/index';
import { updateUserDetails } from '../../helpers/my-profile/index';
import { handleNotificationSetting, handleSubmit, getNotificationSetting } from '../../helpers';
import PasswordEyeIcon from '../../assets/icons/input-field-password-eye.svg?react';
import EyeIcon from '../../assets/icons/eyeclose.svg?react';
import { TOAST_CONFIG } from '../../constants';

interface PasswordErrors {
  currentPassword?: string;
  password?: string;
  confirmPassword?: string;
}

const SecurityAndPrivacy: React.FC = () => {
  const { userData } = useOutletContext<OutletContextType>();

  // Notification Settings State
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [startTime, setStartTime] = useState('05:00');
  const [endTime, setEndTime] = useState('05:00');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});

  // Loading states
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Load notification settings on component mount
  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        await getNotificationSetting(
          setEmailNotifications,
          setSmsNotifications,
          setStartTime,
          setEndTime,
        );
      } catch (error) {
        console.error('Error loading notification settings:', error);
      }
    };

    loadNotificationSettings();
  }, []);

  const handleEmailToggle = async () => {
    await handleNotificationSetting('email', setEmailNotifications, emailNotifications);
  };

  const handleSmsToggle = async () => {
    await handleNotificationSetting('sms', setSmsNotifications, smsNotifications);
  };

  const handleSaveNotifications = async () => {
    setIsSavingNotifications(true);
    try {
      await handleSubmit(startTime, endTime);
      toast.success('Notification settings saved successfully!', TOAST_CONFIG.SUCCESS);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      toast.error('Failed to save notification settings. Please try again.', TOAST_CONFIG.ERROR);
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const handleUpdatePassword = async () => {
    const newErrors: PasswordErrors = {};

    // Validation
    if (!currentPassword) {
      newErrors.currentPassword = 'Current Password is required';
    }
    if (!newPassword) {
      newErrors.password = 'Password is required';
    } else if (newPassword.length < 6 || !/\d/.test(newPassword) || !/[a-zA-Z]/.test(newPassword)) {
      newErrors.password =
        'Password must be at least 6 characters long and contain both digits and letters';
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordErrors({});

    // Create FormData with all required user details
    const formDataToSend = new FormData();
    formDataToSend.append('firstname', userData.firstname);
    formDataToSend.append('lastname', userData.lastname);
    formDataToSend.append('title', userData.title);
    formDataToSend.append('phone', userData.phone);
    formDataToSend.append('street', userData.street);
    formDataToSend.append('city', userData.city);
    formDataToSend.append('state', userData.state);
    formDataToSend.append('zipcode', userData.zipcode);
    formDataToSend.append('division', userData.division);
    formDataToSend.append('password', newPassword);
    formDataToSend.append('currentPassword', currentPassword);

    try {
      const response = await updateUserDetails(formDataToSend);
      if (response?.success) {
        toast.success('Password updated successfully!', TOAST_CONFIG.SUCCESS);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(response?.data?.message || 'Failed to update password', TOAST_CONFIG.ERROR);
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Network error occurred. Please try again.', TOAST_CONFIG.ERROR);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="px-6 py-1 max-w-7xl space-y-12">
        {/* Notification Settings Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-gotham-bold text-secondary mb-2">Notification Settings</h2>
            <p className="text-sm font-gotham text-muted">
              By opting in, you agree to receive email and/or SMS alerts with important company
              updates, announcements, and work-related information.
            </p>
          </div>

          <div className="space-y-4">
            {/* Email Toggle */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-gotham-medium text-secondary w-16">Email :</span>
              <ToggleButton
                checked={emailNotifications}
                onChange={handleEmailToggle}
                title="Toggle email notifications"
                width="w-12"
                height="h-6"
                toggleIconName="tick"
                colorVariant="green"
              />
            </div>

            {/* SMS Toggle */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-gotham-medium text-secondary w-16">SMS :</span>
              <ToggleButton
                checked={smsNotifications}
                onChange={handleSmsToggle}
                title="Toggle SMS notifications"
                width="w-12"
                height="h-6"
                toggleIconName="tick"
                colorVariant="green"
              />
            </div>

            {/* Time Range */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-gotham-medium text-secondary">
                Between the hours of :
              </span>
              <div className="flex items-center space-x-2">
                <TimeInput value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                <span className="text-sm font-gotham-medium text-secondary">and</span>
                <TimeInput value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <Button
            variant="primary"
            onClick={handleSaveNotifications}
            disabled={isSavingNotifications}
            className="w-20"
          >
            {isSavingNotifications ? 'Saving...' : 'Save'}
          </Button>
        </div>

        {/* Change Password Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-gotham-bold text-secondary mb-2">Change Password</h2>
            <p className="text-sm font-gotham text-muted">
              Update your password to ensure security and maintain access
            </p>
          </div>

          <div className="space-y-4 max-w-md">
            {/* Current Password */}
            <InputField
              label="Current Password"
              type={showCurrentPassword ? 'text' : 'password'}
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              error={passwordErrors.currentPassword}
              icon={
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="w-full cursor-pointer h-full flex items-center justify-center hover:opacity-70 transition-opacity"
                >
                  {showCurrentPassword ? (
                    <EyeIcon className="w-5 h-5 text-[var(--text-primary)]" />
                  ) : (
                    <PasswordEyeIcon className="w-5 h-5 text-[var(--text-primary)]" />
                  )}
                </button>
              }
            />

            {/* New Password */}
            <InputField
              label="New Password"
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={passwordErrors.password}
              icon={
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="w-full cursor-pointer h-full flex items-center justify-center hover:opacity-70 transition-opacity"
                >
                  {showNewPassword ? (
                    <EyeIcon className="w-5 h-5 text-[var(--text-primary)]" />
                  ) : (
                    <PasswordEyeIcon className="w-5 h-5 text-[var(--text-primary)]" />
                  )}
                </button>
              }
            />

            {/* Confirm Password */}
            <InputField
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Enter confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={passwordErrors.confirmPassword}
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

          {/* Update Password Button */}
          <Button
            variant="primary"
            onClick={handleUpdatePassword}
            disabled={isUpdatingPassword}
            className="w-40"
          >
            {isUpdatingPassword ? 'Updating...' : 'Update Password'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SecurityAndPrivacy;

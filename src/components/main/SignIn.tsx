import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { forgotPassword, signIn } from '../../helpers/sign-in';
import { getTokenFromLocalStorage } from '../../helpers';
import { SignInErrors } from '../../types/SignIn.types.ts';
import InputField from '../reusable/custom/InputField';
import Button from '../reusable/custom/Button';
import Checkbox from '../reusable/custom/Checkbox';
import PasswordEyeIcon from '../../assets/icons/input-field-password-eye.svg?react';
import EyeIcon from '../../assets/icons/eyeclose.svg?react';
import AuthNavbar from '../reusable/AuthNavbar';
import { TOAST_CONFIG } from '../../constants/index.ts';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<SignInErrors>({});
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = getTokenFromLocalStorage();
    if (accessToken) {
      navigate('/patient-list');
    }
  }, [navigate]);

  const handleSubmitSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationErrors: SignInErrors = {};

    if (!email.trim()) {
      validationErrors.email = '*Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      validationErrors.email = '*Email is not valid';
    }

    if (!password) {
      validationErrors.password = '*Password is required';
    } else if (password.length < 6 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
      validationErrors.password =
        '*Password must be at least 6 characters long and contain both digits and letters';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      await signIn(email, password, navigate, rememberMe);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      toast.error('Please enter your email first', TOAST_CONFIG.ERROR);
      return;
    }

    setShowForgotPassword(true);
    setLoading(true);

    try {
      await forgotPassword(email);
    } finally {
      setLoading(false);
      setShowForgotPassword(false);
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase();
    setEmail(value);

    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, email: '*Email is required' }));
    } else if (!/\S+@\S+\.\S+/.test(value)) {
      setErrors((prev) => ({ ...prev, email: '*Email is not valid' }));
    } else {
      setErrors((prev) => ({ ...prev, email: '' }));
    }
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);

    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, password: '*Password is required' }));
    } else if (value.length < 6 || !/\d/.test(value) || !/[a-zA-Z]/.test(value)) {
      setErrors((prev) => ({
        ...prev,
        password:
          '*Password must be at least 6 characters long and contain both digits and letters',
      }));
    } else {
      setErrors((prev) => ({ ...prev, password: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-main">
      <AuthNavbar />
      <div className="flex items-start lg:items-center justify-center p-4 min-h-[calc(100vh-80px)]">
        <div className="bg-white rounded-3xl card-shadow-lg w-full max-w-[520px] p-10">
          {loading && showForgotPassword ? (
            <div className="text-center">
              <div className="font-gotham-medium text-lg text-muted mb-4">
                Sending reset link...
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitSignIn} className="space-y-6">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="font-gotham-bold text-2xl text-primary mb-2">Welcome back!</h1>
                <p className="font-gotham text-sm text-muted leading-5 max-w-[398px] mx-auto">
                  Enter new billing items for the patient, including services, fees, and applicable
                  dates.
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                <InputField
                  label="Email ID"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={handleEmailChange}
                  error={errors.email}
                  className="w-full"
                />

                <InputField
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePasswordChange}
                  error={errors.password}
                  className="w-full"
                  icon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="w-full h-full flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
                    >
                      {showPassword ? (
                        <EyeIcon className="w-5 h-5 text-[var(--text-primary)]" />
                      ) : (
                        <PasswordEyeIcon className="w-5 h-5 text-[var(--text-primary)]" />
                      )}
                    </button>
                  }
                />
              </div>

              {/* Remember Me and Forgot Password */}
              <div className="flex items-center justify-between">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={setRememberMe}
                  label="Remember Me"
                  className="text-sm"
                />
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm cursor-pointer font-gotham-medium text-primary underline hover:opacity-80 transition-opacity"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                variant="primary"
                type="submit"
                loading={loading}
                loadingText="Signing in..."
                className="w-full h-[52px] rounded-[50px] font-gotham-bold text-sm"
              >
                Submit
              </Button>

              {/* Sign Up Link */}
              <div className="text-center">
                <p className="text-sm font-gotham text-secondary">
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    className="font-gotham-medium text-primary hover:opacity-80 transition-opacity"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignIn;

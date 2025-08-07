import { useState, FormEvent, ChangeEvent } from 'react';
import { COUNTRY_CODE_OPTIONS } from '../../constants/countryCodes';
import { Link, useNavigate } from 'react-router-dom';
import BackCircle from '../../assets/icons/BackCircle.svg?react';
import BackArrow from '../../assets/icons/BackArrow.svg?react';
import { titleToDivision } from '../../helpers';
import { verifyOtp, sendOTP } from '../../helpers/sign-up';
import { SignUpErrors } from '../../types/SignUp.types.ts';
import InputField from '../reusable/custom/InputField';
import Button from '../reusable/custom/Button';
import Checkbox from '../reusable/custom/Checkbox';
import Dropdown from '../reusable/custom/Dropdown';
import PasswordEyeIcon from '../../assets/icons/input-field-password-eye.svg?react';
import EyeIcon from '../../assets/icons/eyeclose.svg?react';
import AuthNavbar from '../reusable/AuthNavbar';
import AccessPasswordModal from '../reusable/AccessPasswordModal';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState<boolean>(true);
  const [firstname, setFirstname] = useState<string>('');
  const [lastname, setLastname] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('+1');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [errors, setErrors] = useState<SignUpErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [otp, setOtp] = useState<string>('');
  const [OtpSaved, setOtpStatus] = useState<boolean>(false);
  const [division, setDivision] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [showOtherCompany, setShowOtherCompany] = useState<boolean>(false);
  const [otherCompanyName, setOtherCompanyName] = useState<string>('');

  const handleAccessSubmit = (password: string) => {
    if (password === '777333') {
      setIsAuthenticated(true);
      setIsAccessModalOpen(false);
    } else {
      navigate('/');
    }
  };

  const handleAccessClose = () => {
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <AccessPasswordModal
        isOpen={isAccessModalOpen}
        onSubmit={handleAccessSubmit}
        onClose={handleAccessClose}
      />
    );
  }

  const titleOptions = [
    { label: 'Select Title', value: '' },
    { label: 'Physician', value: 'Physician' },
    { label: 'Nurse Practitioner', value: 'Nurse Practitioner' },
    { label: "Physician's Assistant", value: "Physician's Assistant" },
    { label: 'Operations', value: 'Operations' },
    { label: 'IT Admin', value: 'IT Admin' },
    { label: 'Hospital Staff', value: 'Hospital Staff' },
  ];

  const companyOptions = [
    { label: 'Select Your Company Name', value: '' },
    { label: 'Virginia Rehab Physicians', value: 'Virginia Rehab Physicians' },
    { label: 'Others', value: 'Others' },
  ];

  const handleTitleChange = (value: string | number | (string | number)[]) => {
    const selectedTitle = value as keyof typeof titleToDivision;
    setTitle(selectedTitle);
    setDivision(titleToDivision[selectedTitle]);
  };

  const handleCompanyChange = (value: string | number | (string | number)[]) => {
    const selectedCompany = value as string;
    setCompanyName(selectedCompany);
    setShowOtherCompany(selectedCompany === 'Others');
  };

  const handleCountryCodeChange = (value: string | number | (string | number)[]) => {
    setCountryCode(value as string);
  };

  const handleSendOTP = async () => {
    setLoading(true);
    setErrors({});
    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('password', password);
    try {
      await sendOTP(formData, setOtpStatus);
    } finally {
      setLoading(false);
    }
  };

  const changeOTPSaved = () => {
    setOtpStatus(false);
  };

  const resendCode = () => {
    handleSendOTP();
  };

  const handleSubmitSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: SignUpErrors = {};

    if (!email.trim()) {
      errors.email = '*Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is not valid';
    }

    if (!password) {
      errors.password = '*Password is required';
    } else if (password.length < 6 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) {
      errors.password =
        '*Password must be at least 6 characters long and contain both digits and letters';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!termsAccepted) {
      errors.termsAccepted = 'You must accept the terms and conditions';
    }

    if (!firstname) {
      errors.firstname = '*First Name is required';
    }

    if (!lastname) {
      errors.lastname = '*Last Name is required';
    }

    if (!title) {
      errors.title = '*Title is required';
    }

    if (!phone) {
      errors.phone = '*Phone is required';
    }

    if (!companyName) {
      errors.companyName = '*Company Name is required';
    }

    if (companyName === 'Others' && !otherCompanyName.trim()) {
      errors.otherCompanyName = '*Company Name is required';
    }

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
    setLoading(true);
    setErrors({});
    const formData = new URLSearchParams();
    formData.append('email', email);
    formData.append('firstname', firstname);
    formData.append('lastname', lastname);
    formData.append('title', title);
    formData.append('phone', phone);
    formData.append('country_code', countryCode);
    formData.append('password', password);
    formData.append('confirmPassword', confirmPassword);
    formData.append('termsAccepted', termsAccepted.toString());
    formData.append('division', division);
    formData.append('companyName', companyName === 'Others' ? otherCompanyName : companyName);

    if (OtpSaved === false) {
      await handleSendOTP();
    } else {
      try {
        formData.append('otp', otp);
        await verifyOtp(formData, navigate);
      } catch (error) {
        if (error instanceof Error) {
          console.warn(error.message);
        } else {
          console.warn('Unknown error', error);
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-main">
      <AuthNavbar />
      <div className="flex items-start lg:items-center justify-center p-4 min-h-[calc(100vh-80px)]">
        <div className="bg-white rounded-3xl card-shadow-lg w-full max-w-[600px] p-10">
          <form onSubmit={handleSubmitSignUp} className="space-y-6">
            {/* Header with back button for OTP step */}
            {OtpSaved && !loading && (
              <div className="flex items-center justify-between mb-8">
                <button
                  type="button"
                  onClick={() => {
                    setLoading(false);
                    setOtpStatus(false);
                  }}
                  className="relative w-10 h-10 2xl:w-12 2xl:h-12 cursor-pointer transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
                  aria-label="Go back"
                >
                  <div className="absolute inset-0">
                    <BackCircle className="block max-w-none size-full" />
                  </div>
                  <div className="absolute inset-1/4">
                    <BackArrow className="block max-w-none size-full" />
                  </div>
                </button>
                <h1 className="font-gotham-bold text-2xl text-secondary">Sign Up</h1>
                <div className="w-10 h-10 2xl:w-12 2xl:h-12" /> {/* Spacer for centering */}
              </div>
            )}

            {/* Main header for registration form */}
            {!OtpSaved && !loading && (
              <div className="text-center mb-8">
                <h1 className="font-gotham-bold text-2xl text-secondary mb-2">Create Account</h1>
                <p className="font-gotham text-sm text-secondary opacity-60 leading-5">
                  Fill in your information to create a new account
                </p>
              </div>
            )}

            {/* Registration Form Fields */}
            {!OtpSaved && !loading && (
              <div className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Last Name"
                    placeholder="Enter last name"
                    value={lastname}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setLastname(e.target.value)}
                    error={errors.lastname}
                    required
                  />
                  <InputField
                    label="First Name"
                    placeholder="Enter first name"
                    value={firstname}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFirstname(e.target.value)}
                    error={errors.firstname}
                    required
                  />
                </div>

                {/* Title and Phone */}
                <div className="grid grid-cols-1 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="block text-xs 2xl:text-sm text-secondary !mb-2">
                      Title <span className="text-error">*</span>
                    </label>
                    <Dropdown
                      options={titleOptions}
                      value={title}
                      onChange={handleTitleChange}
                      placeholder="Select Title"
                      variant="variant_2"
                      fullWidth
                      clampViewport
                    />
                    {errors.title && <div className="text-error text-xs">{errors.title}</div>}
                  </div>
                  {/* Phone Number with Country Code */}
                  <div className="flex flex-col gap-2">
                    <label className="block text-xs 2xl:text-sm text-secondary !mb-2">
                      Phone Number <span className="text-error">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="w-28 mx-1">
                        <Dropdown
                          options={COUNTRY_CODE_OPTIONS}
                          value={countryCode}
                          onChange={handleCountryCodeChange}
                          fullWidth
                          variant="variant_2"
                          clampViewport
                        />
                      </div>
                      <InputField
                        type="tel"
                        placeholder="Enter phone number"
                        value={phone}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                        error={errors.phone}
                        required
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <InputField
                  label="Email"
                  type="email"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  error={errors.email}
                  required
                />

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    error={errors.password}
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
                  <InputField
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setConfirmPassword(e.target.value)
                    }
                    error={errors.confirmPassword}
                    required
                    icon={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="w-full h-full flex items-center justify-center hover:opacity-70 transition-opacity"
                      >
                        {showConfirmPassword ? (
                          <EyeIcon className="w-5 h-5 text-muted" />
                        ) : (
                          <PasswordEyeIcon className="w-5 h-5 text-muted" />
                        )}
                      </button>
                    }
                  />
                </div>

                {/* Company Selection */}
                <div className="flex flex-col gap-2">
                  <label className="block text-xs 2xl:text-sm text-secondary !mb-2">
                    Company Name <span className="text-error">*</span>
                  </label>
                  <Dropdown
                    options={companyOptions}
                    value={companyName}
                    onChange={handleCompanyChange}
                    placeholder="Select Your Company Name"
                    variant="variant_2"
                    fullWidth
                    clampViewport
                  />
                  {errors.companyName && (
                    <div className="text-error text-xs">{errors.companyName}</div>
                  )}
                </div>

                {/* Other Company Name */}
                {showOtherCompany && (
                  <InputField
                    label="Company Name"
                    placeholder="Enter company name"
                    value={otherCompanyName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setOtherCompanyName(e.target.value)
                    }
                    error={errors.otherCompanyName}
                    required
                  />
                )}

                {/* Terms and Conditions */}
                <div className="space-y-2">
                  <Checkbox
                    id="termsAccepted"
                    checked={termsAccepted}
                    onChange={setTermsAccepted}
                    label="I Accept Terms And Conditions"
                    className="text-sm"
                  />
                  {errors.termsAccepted && (
                    <div className="text-error text-xs">{errors.termsAccepted}</div>
                  )}
                </div>
              </div>
            )}

            {/* OTP Verification Section */}
            {OtpSaved && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-gotham-bold text-xl text-secondary mb-2">
                    Verify Your Email
                  </h2>
                  <p className="font-gotham text-sm text-secondary opacity-60">
                    Enter the confirmation code we sent to {email}
                  </p>
                </div>

                <InputField
                  label="Verification Code"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setOtp(e.target.value)}
                />

                <p className="text-sm font-gotham text-secondary">
                  Didn't receive the code?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      changeOTPSaved();
                      resendCode();
                    }}
                    className="text-primary underline hover:opacity-80 transition-opacity"
                  >
                    Resend Code
                  </button>
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              variant="primary"
              type="submit"
              loading={loading && !OtpSaved}
              loadingText="Please wait..."
              className="w-full h-[52px] rounded-[50px] font-gotham-bold text-sm"
            >
              {OtpSaved ? 'Verify & Create Account' : 'Create Account'}
            </Button>

            {/* Sign In Link */}
            {!loading && (
              <div className="text-center">
                <p className="text-sm font-gotham text-secondary">
                  Already have an account?{' '}
                  <Link
                    to="/signin"
                    className="font-gotham-medium text-primary hover:opacity-80 transition-opacity"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

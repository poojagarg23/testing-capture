import { toast } from 'react-toastify';
import { BASE_API_URL, TOAST_CONFIG } from '../../constants/index.ts';
import { NavigateFunction } from '../../types/index.ts';

export const verifyOtp = async (formData: URLSearchParams, navigate: NavigateFunction) => {
  try {
    const response = await fetch(`${BASE_API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });
    const data = await response.json();
    if (data.message === 'User registered successfully') {
      toast.success('User Registered successfully!', TOAST_CONFIG.SUCCESS);
      navigate('/signin');
    }
    if (data.message === 'Invalid OTP') {
      toast.error('Invalid OTP', TOAST_CONFIG.ERROR);
    }
  } catch (error) {
    if (error instanceof Error) {
      toast.error(error.message, TOAST_CONFIG.ERROR);
    } else {
      toast.error('An unknown error occurred', TOAST_CONFIG.ERROR);
    }
  }
};

export const sendOTP = async (
  formData: URLSearchParams,
  setOtpStatus: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    const data = await response.json();
    if (response.ok) {
      toast.success('OTP sent successfully!', TOAST_CONFIG.SUCCESS);
      setOtpStatus(true);
    } else {
      toast.error(data.message, TOAST_CONFIG.ERROR);
    }
  } catch (error) {
    console.warn(error);
  }
};

import { toast } from 'react-toastify';
import { storeTokenInLocalStorage } from '..';
import { BASE_API_URL, TOAST_CONFIG } from '../../constants/index.ts';
import { NavigateFunction } from '../../types/index.ts';
export const forgotPassword = async (email: string) => {
  try {
    const response = await fetch(`${BASE_API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (response.ok) {
      toast.success('Password reset link sent to your email', TOAST_CONFIG.SUCCESS);
      setTimeout(() => {
        toast.info(
          "Please check your spam folder if you don't see the email in your inbox",
          TOAST_CONFIG.INFO,
        );
      }, 3000);
    } else {
      toast.error(data.message || 'Failed to send reset link', TOAST_CONFIG.ERROR);
    }
  } catch (error) {
    console.error('Error:', error);
    toast.error('Network error', TOAST_CONFIG.ERROR);
  }
};

export const signIn = async (
  email: string,
  password: string,
  navigate: NavigateFunction,
  rememberMe: boolean = false,
) => {
  try {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    };

    const response = await fetch(`${BASE_API_URL}/auth/signin`, requestOptions);
    const data = await response.json();

    if (response.ok && data.token) {
      storeTokenInLocalStorage(data.token, rememberMe);
      toast.success('Signed in successfully', TOAST_CONFIG.SUCCESS);
      navigate('/patient-list');
    } else {
      toast.error('Invalid email or password', TOAST_CONFIG.ERROR);
      navigate('/signin');
    }
  } catch (error) {
    console.error('Error:', error);
    toast.error('Network error', TOAST_CONFIG.ERROR);
  }
};

import { toast } from 'react-toastify';
import { BASE_API_URL, TOAST_CONFIG } from '../../constants/index.ts';
import { NavigateFunction } from '../../types/index.ts';

export const resetPassword = async (
  token: string | null,
  newPassword: string,
  navigate: NavigateFunction,
) => {
  try {
    const response = await fetch(`${BASE_API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, newPassword }),
    });

    const data = await response.json();
    if (response.ok) {
      toast.success('Password reset successful', TOAST_CONFIG.SUCCESS);
      setTimeout(() => navigate('/signin'), 2000);
    } else {
      toast.error(data.message || 'Password reset failed');
    }
  } catch (error) {
    console.error('Error:', error);
    toast.error('Network error');
  }
};

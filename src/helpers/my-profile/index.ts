import { getTokenFromLocalStorage } from '..';
import { BASE_API_URL } from '../../constants/index.ts';

export const deleteProfilePic = async (userId: number, profilePicAlias: string) => {
  try {
    const response = await fetch(`${BASE_API_URL}/profile/delete-profile-pic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getTokenFromLocalStorage()}`,
      },
      body: JSON.stringify({
        id: userId,
        profile_pic: profilePicAlias,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to delete old profile picture', error);
    return false;
  }
};

export const updateUserDetails = async (formDataToSend: FormData) => {
  try {
    const response = await fetch(`${BASE_API_URL}/profile/user-details`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`,
      },
      body: formDataToSend,
    });

    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message);
  }
};

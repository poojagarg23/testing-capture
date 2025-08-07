import { getTokenFromLocalStorage } from '..';
import { BASE_API_URL } from '../../constants/index.ts';

export const getAllUsersWithPics = async () => {
  try {
    const response = await fetch(`${BASE_API_URL}/profile/all-users-with-pics`, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    return { success: true, users: data.users };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
};

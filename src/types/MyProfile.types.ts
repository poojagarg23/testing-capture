import { UserData } from './index.js';

export interface OutletContextType {
  userData: UserData | null;
  profilePicUrl: string | null;
  getUserDetails: () => Promise<void>;
}

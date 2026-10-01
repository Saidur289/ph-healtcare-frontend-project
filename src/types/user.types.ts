import { UserRole } from "@/lib/authUtils";

// shape of GET /auth/me
export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status?: "ACTIVE" | "BLOCKED" | "DELETED";
  emailVerified?: boolean;
  needPasswordChange?: boolean;
  image?: string | null;
  // role profile (only the one matching the role is set)
  Doctor?: IUserProfile & { designation?: string; averageRating?: number; isAvailable?: boolean };
  Patient?: IUserProfile & { address?: string | null };
  Admin?: IUserProfile;
}

export interface IUserProfile {
  id: string;
  name: string;
  email: string;
  profilePhoto?: string | null;
  contactNumber?: string | null;
}

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
}

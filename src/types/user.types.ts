import { UserRole } from "@/lib/authUtils";

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

import { redirect } from "next/navigation";
import { getUserInfo } from "@/services/auth.service";
import { getDefaultDashboardRoute, UserRole } from "./authUtils";

// Server-side guard for layouts (defense in depth: proxy.ts checks first, the API
// checks every request too). Returns the logged-in user or redirects.
export const requireUser = async (allowedRoles?: UserRole[]) => {
  const user = await getUserInfo();
  if (!user) {
    redirect("/login");
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    redirect(getDefaultDashboardRoute(user.role));
  }
  return user;
};

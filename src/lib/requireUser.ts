import { redirect } from "next/navigation";
import { getUserInfo } from "@/services/auth.service";
import { getDefaultDashboardRoute, UserRole } from "./authUtils";

// Server-side guard for layouts (defense in depth: proxy.ts checks first, the API
// checks every request too). Returns the logged-in user or redirects.
export const requireUser = async (allowedRoles?: UserRole[]) => {
  const user = await getUserInfo();
  if (!user) {
    // the cookies looked valid to proxy.ts but the API rejected them (session revoked,
    // user blocked/deleted): ?expired=1 tells proxy.ts to clear them instead of
    // bouncing back here, which would loop
    redirect("/login?expired=1");
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    redirect(getDefaultDashboardRoute(user.role));
  }
  return user;
};

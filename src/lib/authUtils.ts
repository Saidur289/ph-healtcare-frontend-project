export type UserRole = "SUPER_ADMIN" | "ADMIN" | "DOCTOR" | "PATIENT";
// pages a logged-in user is sent away from. /verify-email and /reset-password are
// NOT here: they must stay reachable (otherwise redirect loops).
export const authRoutes = ["/login", "/register", "/forgot-password"];
export const isAuthRoutes = (pathname: string) => {
  return authRoutes.some((router: string) => router === pathname);
};
export type RouteConfig = {
  exact: string[];
  pattern: RegExp[];
};
export const commonProtectedRoute: RouteConfig = {
  exact: ["/my-profile", "/change-password"],
  pattern: [],
};
export const patientProtectedRoutes: RouteConfig = {
  pattern: [/^\/dashboard/], // Matches any path that starts with /dashboard
  exact: ["/payment/success"],
};
export const doctorProtectedRoutes: RouteConfig = {
  pattern: [/^\/doctor\/dashboard/], // Matches any path that starts with /doctor/dashboard
  exact: [],
};
export const adminProtectedRoutes: RouteConfig = {
  pattern: [/^\/admin\/dashboard/], // Matches any path that starts with /admin/dashboard
  exact: [],
};
export const isRouteMatches = (pathname: string, routeConfig: RouteConfig) => {
  if (routeConfig.exact.includes(pathname)) return true;
  return routeConfig.pattern.some((pattern) => pattern.test(pathname));
};
export const getRouteOwner = (
  pathname: string,
): "SUPER_ADMIN" | "ADMIN" | "DOCTOR" | "PATIENT" | "COMMON" | null => {
  if (isRouteMatches(pathname, adminProtectedRoutes)) {
    return "ADMIN";
  } else if (isRouteMatches(pathname, doctorProtectedRoutes)) {
    return "DOCTOR";
  } else if (isRouteMatches(pathname, patientProtectedRoutes)) {
    return "PATIENT";
  } else if (isRouteMatches(pathname, commonProtectedRoute)) {
    return "COMMON";
  } else {
    return null; // public route
  }
};
export const getDefaultDashboardRoute = (role: UserRole) => {
  if (role === "ADMIN" || role === "SUPER_ADMIN") return "/admin/dashboard";
  if (role === "DOCTOR") return "/doctor/dashboard";
  if (role === "PATIENT") return "/dashboard";
  return "/";
};
// Only same-site relative paths like "/dashboard?x=1" are allowed.
// Blocks open redirects such as "https://evil.com", "//evil.com", "/\evil.com".
const SAFE_REDIRECT_BASE = "http://internal.invalid";
export const getSafeInternalPathname = (redirectPath: string) => {
  if (typeof redirectPath !== "string") return null;
  if (!redirectPath.startsWith("/") || redirectPath.startsWith("//")) {
    return null;
  }
  // backslashes and control characters are treated as "//" by some browsers
  if (/[\\\u0000-\u001F\u007F]/.test(redirectPath)) return null;
  try {
    const url = new URL(redirectPath, SAFE_REDIRECT_BASE);
    if (url.origin !== SAFE_REDIRECT_BASE) return null;
    return url.pathname;
  } catch {
    return null;
  }
};
export const isValidateRedirect = (redirectPath: string, role: UserRole) => {
  const pathname = getSafeInternalPathname(redirectPath);
  if (!pathname) return false;
  const unifyRoleForSuperAdmin = role === "SUPER_ADMIN" ? "ADMIN" : role;
  role = unifyRoleForSuperAdmin;
  const getOwner = getRouteOwner(pathname);
  if (getOwner === "COMMON" || getOwner === null) return true;
  if (getOwner === role) return true;
  return false;
};

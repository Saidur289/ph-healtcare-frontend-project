export type UserRole = "SUPER_ADMIN" | "ADMIN" | "DOCTOR" | "PATIENT";
export const authRoutes = [
  "/login",
  "/register",
  "/forget-password",
  "/reset-password",
  "/verify-email",
];
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
export const isValidateRedirect = (redirectPath: string, role: UserRole) => {
  const unifyRoleForSuperAdmin = role === "SUPER_ADMIN" ? "ADMIN" : role;
  role = unifyRoleForSuperAdmin;
  const getOwner = getRouteOwner(redirectPath);
  if (getOwner === "COMMON" || getOwner === null) return true;
  if (getOwner === role) return true;
  return false;
};

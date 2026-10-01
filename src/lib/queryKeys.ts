// TanStack Query keys shared by server prefetch and client hooks (a "use client"
// module can't export plain values to server components).
export const queryKeys = {
  adminDashboard: ["admin-dashboard-data"] as const,
  notifications: ["dashboard-notifications"] as const,
};

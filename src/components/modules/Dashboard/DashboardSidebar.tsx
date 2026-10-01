import { getDefaultDashboardRoute } from "@/lib/authUtils";

import { getUserInfo } from "@/services/auth.service";
import { NavSection } from "@/types/dashboard.types";

import DashboardSidebarContent from "./DashboardSidebarContent";
import { commonNavItems } from "@/lib/navItem";

const DashboardSidebar = async () => {
  const userInfo = await getUserInfo();
  // the dashboard layout already redirects logged-out users; this is just a safe fallback
  if (!userInfo) return null;
  const navItems: NavSection[] = commonNavItems(userInfo.role);
  const dashboardHome = getDefaultDashboardRoute(userInfo.role);

  return (
    <DashboardSidebarContent
      navItems={navItems}
      dashboardHome={dashboardHome}
    />
  );
};

export default DashboardSidebar;

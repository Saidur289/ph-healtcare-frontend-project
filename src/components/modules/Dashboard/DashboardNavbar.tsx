import { commonNavItems } from "@/lib/navItem";
import { getUserInfo } from "@/services/auth.service";
import { NavSection } from "@/types/dashboard.types";

import DashboardNavbarContent from "./DashboardNavbarContent";
import { getDefaultDashboardRoute } from "@/lib/authUtils";

const DashboardNavbar = async () => {
  const userInfo = await getUserInfo();
  // the dashboard layout already redirects logged-out users; this is just a safe fallback
  if (!userInfo) return null;
  const navItems: NavSection[] = commonNavItems(userInfo.role);
  const dashboardHome = getDefaultDashboardRoute(userInfo.role);

  return (
    <DashboardNavbarContent
      dashboardHome={dashboardHome}
      navItems={navItems}
      userInfo={userInfo}
    />
  );
};

export default DashboardNavbar;

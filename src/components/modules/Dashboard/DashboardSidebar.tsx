import { getDefaultDashboardRoute } from "@/lib/authUtils";

import { getUserInfo } from "@/services/auth.service";
import { NavSection } from "@/types/dashboard.types";

import DashboardSidebarContent from "./DashboardSidebarContent";
import { commonNavItems } from "@/lib/navItem";

const DashboardSidebar = async () => {
  const userInfo = await getUserInfo();
  const navItems: NavSection[] = commonNavItems(userInfo.role);
  const dashboardHome = getDefaultDashboardRoute(userInfo.role);

  return (
    <DashboardSidebarContent
      navItems={navItems}
      dashboardHome={dashboardHome}
      userInfo={userInfo}
    />
  );
};

export default DashboardSidebar;

import { commonNavItems } from "@/lib/navItem";
import { getUserInfo } from "@/services/auth.service";
import { NavSection } from "@/types/dashboard.types";

import DashboardNavbarContent from "./DashboardNavbarContent";
import { getDefaultDashboardRoute } from "@/lib/authUtils";

const DashboardNavbar = async () => {
  const userInfo = await getUserInfo();
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

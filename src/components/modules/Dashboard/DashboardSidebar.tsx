import { getDefaultDashboardRoute } from "@/lib/authUtils";
import { getCommonNavItems } from "@/lib/navItem";
import { getUserInfo } from "@/services/auth.service";
import { NavSection } from "@/types/dashboard.types";
import React from "react";
import DashboardSidebarContent from "./DashboardSidebarContent";

const DashboardSidebar = async () => {
  const userInfo = await getUserInfo();
  const navItems: NavSection[] = getCommonNavItems(userInfo.role);
  const dashboardHome = getDefaultDashboardRoute(userInfo.role);
  console.log("******************************", navItems, dashboardHome);
  return (
    <DashboardSidebarContent
      navItems={navItems}
      dashboardHome={dashboardHome}
      userInfo={userInfo}
    />
  );
};

export default DashboardSidebar;

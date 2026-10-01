"use client";
import { NavSection } from "@/types/dashboard.types";
import SidebarNav from "./SidebarNav";

interface DashboardSidebarContentProps {
  navItems: NavSection[];
  dashboardHome: string;
}

// desktop: fixed 240px navy column (the mobile drawer lives in the navbar)
const DashboardSidebarContent = ({ navItems, dashboardHome }: DashboardSidebarContentProps) => (
  <aside className="hidden h-full w-60 shrink-0 md:block">
    <SidebarNav navItems={navItems} dashboardHome={dashboardHome} />
  </aside>
);

export default DashboardSidebarContent;

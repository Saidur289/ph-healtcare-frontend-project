import { NavSection } from "@/types/dashboard.types";
import { UserInfo } from "@/types/user.types";

interface DashboardNavbarProps {
  navItems: NavSection[];
  userInfo: UserInfo;
  dashboardHome: string;
}

const DashboardNavbarContent = ({
  dashboardHome,
  navItems,
  userInfo,
}: DashboardNavbarProps) => {
  return <div>DashboardNavbarContent</div>;
};

export default DashboardNavbarContent;

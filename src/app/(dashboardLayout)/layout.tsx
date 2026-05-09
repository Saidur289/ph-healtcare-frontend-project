import DashboardNavbar from "@/components/modules/Dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/modules/Dashboard/DashboardSidebar";
import { ReactNode } from "react";

const RootDashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex h-screen, overflow-hidden">
      {/* dashboard layout */}
      <DashboardSidebar />
      <div className="flex flex-1 overflow-hidden flex-col">
        {/* dashboard navbar */}
        <DashboardNavbar />
        <main className="flex-1 overflow-y-auto bg-muted/10 p-4 md:p-6">
          {/* dashboard content */}
          <div>{children}</div>
        </main>
      </div>
    </div>
  );
};

export default RootDashboardLayout;

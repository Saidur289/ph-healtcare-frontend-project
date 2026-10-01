import DashboardNavbar from "@/components/modules/Dashboard/DashboardNavbar";
import DashboardSidebar from "@/components/modules/Dashboard/DashboardSidebar";
import { requireUser } from "@/lib/requireUser";
import { ReactNode } from "react";

const RootDashboardLayout = async ({ children }: { children: ReactNode }) => {
  // every dashboard page needs a logged-in user
  await requireUser();
  return (
    <div className="flex h-screen overflow-hidden">
      {/* dashboard layout */}
      <DashboardSidebar />
      <div className="flex flex-1 overflow-hidden flex-col">
        {/* dashboard navbar */}
        <DashboardNavbar />
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-6">
          {/* dashboard content */}
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default RootDashboardLayout;

import PublicFooter from "@/components/modules/Public/PublicFooter";
import PublicNavbar from "@/components/modules/Public/PublicNavbar";
import { getDefaultDashboardRoute } from "@/lib/authUtils";
import { getUserInfo } from "@/services/auth.service";
import type { ReactNode } from "react";

export default async function CommonLayout({ children }: { children: ReactNode }) {
  const user = await getUserInfo();
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar dashboardHref={user ? getDefaultDashboardRoute(user.role) : null} />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}

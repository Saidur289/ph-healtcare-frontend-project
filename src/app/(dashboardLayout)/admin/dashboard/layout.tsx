import type { ReactNode } from "react";
import { requireUser } from "@/lib/requireUser";

export default async function AdminDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireUser(["ADMIN", "SUPER_ADMIN"]);
  return <>{children}</>;
}

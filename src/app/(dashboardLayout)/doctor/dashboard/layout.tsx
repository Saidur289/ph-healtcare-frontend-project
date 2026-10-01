import type { ReactNode } from "react";
import { requireUser } from "@/lib/requireUser";

export default async function DoctorDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireUser(["DOCTOR"]);
  return <>{children}</>;
}

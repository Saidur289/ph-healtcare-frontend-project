import type { ReactNode } from "react";
import { requireUser } from "@/lib/requireUser";

export default async function PatientDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireUser(["PATIENT"]);
  return <>{children}</>;
}

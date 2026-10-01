import type { ReactNode } from "react";

export default function CommonProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}

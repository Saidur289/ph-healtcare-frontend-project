import { ViewTransition, type ReactNode } from "react";

// Page-to-page transition (used by the route groups' template.tsx, which remounts on every
// navigation). Runs on the browser's View Transitions API: the old page scales to 0.98 and fades,
// the new one rises from 15px on a spring curve. See the "page" rules in globals.css.
// Browsers without support just swap pages, as before.
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      {children}
    </ViewTransition>
  );
}

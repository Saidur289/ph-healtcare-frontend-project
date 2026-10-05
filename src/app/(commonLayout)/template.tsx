import { PageTransition } from "@/components/motion/PageTransition";
import type { ReactNode } from "react";

// a template remounts on every navigation, so the page enter / exit transition runs each time
export default function Template({ children }: { children: ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}

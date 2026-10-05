"use client";
import { springs } from "@/lib/motion";
import { NavSection } from "@/types/dashboard.types";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { motion } from "motion/react";
import { useSyncExternalStore } from "react";
import SidebarNav from "./SidebarNav";

interface DashboardSidebarContentProps {
  navItems: NavSection[];
  dashboardHome: string;
}

const STORAGE_KEY = "ph.sidebar.compact";

// The collapsed state is remembered per browser. localStorage can be unavailable (private windows),
// so the in-memory value is the fallback. useSyncExternalStore: the server always renders expanded.
let memory = false;
const listeners = new Set<() => void>();
const readCompact = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === null ? memory : saved === "1";
  } catch {
    return memory;
  }
};
const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
};
const writeCompact = (value: boolean) => {
  memory = value;
  try {
    localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    /* kept in memory only */
  }
  listeners.forEach((listener) => listener());
};

// Desktop sidebar: 240px, or a 72px icon rail when collapsed. The width springs between the two
// and the page content reflows with it. (The mobile drawer lives in the navbar.)
const DashboardSidebarContent = ({ navItems, dashboardHome }: DashboardSidebarContentProps) => {
  const compact = useSyncExternalStore(subscribe, readCompact, () => false);
  const toggle = () => writeCompact(!compact);

  return (
    // named for view transitions: the sidebar stays still while the page content changes
    <motion.aside
      initial={false}
      animate={{ width: compact ? 72 : 240 }}
      transition={springs.page}
      className="relative hidden h-full shrink-0 md:block"
      style={{ viewTransitionName: "app-sidebar" }}
    >
      <SidebarNav navItems={navItems} dashboardHome={dashboardHome} compact={compact} />
      <motion.button
        type="button"
        onClick={toggle}
        whileTap={{ scale: 0.9 }}
        aria-label={compact ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!compact}
        className="absolute -right-3 top-[4.75rem] z-10 flex h-7 w-7 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-md transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      >
        {compact ? <PanelLeftOpen className="h-3.5 w-3.5" aria-hidden /> : <PanelLeftClose className="h-3.5 w-3.5" aria-hidden />}
      </motion.button>
    </motion.aside>
  );
};

export default DashboardSidebarContent;

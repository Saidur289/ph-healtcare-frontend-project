"use client";
import { useLogout } from "@/hooks/useLogout";
import { getIconComponent } from "@/lib/iconMapper";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { NavSection } from "@/types/dashboard.types";
import { HeartPulse, Loader2, LogOut } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState } from "react";

interface SidebarNavProps {
  navItems: NavSection[];
  dashboardHome: string;
  onNavigate?: () => void;
  // icon-only rail (desktop collapse)
  compact?: boolean;
}

// "/" and the dashboard home only match exactly; other items also match their sub-pages
const isActivePath = (pathname: string, href: string, dashboardHome: string) =>
  href === "/" || href === dashboardHome
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.12 } };

// Navy sidebar. The active item sits on a glowing pill that glides to the new item (shared
// layoutId), and a softer highlight follows the pointer / keyboard focus. Used by the desktop
// sidebar (also compact) and the mobile drawer; each copy has its own LayoutGroup.
const SidebarNav = ({ navItems, dashboardHome, onNavigate, compact = false }: SidebarNavProps) => {
  const pathname = usePathname();
  const { logout, isLoggingOut } = useLogout();
  const [hovered, setHovered] = useState<string | null>(null);
  const groupId = useId();

  return (
    <LayoutGroup id={groupId}>
      <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
        <div className={cn("flex h-16 shrink-0 items-center", compact ? "justify-center px-2" : "px-5")}>
          <Link
            href={dashboardHome}
            onClick={onNavigate}
            aria-label={compact ? "PH Healthcare home" : undefined}
            className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_0_24px_-6px] shadow-sidebar-primary">
              <HeartPulse className="h-4 w-4" aria-hidden />
            </span>
            <AnimatePresence initial={false}>
              {!compact && (
                <motion.span {...fade} className="whitespace-nowrap text-base font-semibold tracking-tight text-white">
                  PH Healthcare
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        <nav aria-label="Dashboard" className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-3 py-3" onMouseLeave={() => setHovered(null)}>
          {navItems.map((section) => (
            <div key={section.title ?? "main"}>
              {section.title &&
                (compact ? (
                  <div className="mx-2 mb-2 h-px bg-sidebar-border" aria-hidden />
                ) : (
                  <p className="mb-1.5 whitespace-nowrap px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                    {section.title}
                  </p>
                ))}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActivePath(pathname, item.href, dashboardHome);
                  const Icon = getIconComponent(item.icon);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        onMouseEnter={() => setHovered(item.href)}
                        onFocus={() => setHovered(item.href)}
                        onBlur={() => setHovered(null)}
                        aria-current={active ? "page" : undefined}
                        aria-label={compact ? item.title : undefined}
                        title={compact ? item.title : undefined}
                        className={cn(
                          "relative isolate flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                          compact && "justify-center px-0",
                          active ? "text-sidebar-primary-foreground" : "hover:text-sidebar-accent-foreground",
                        )}
                      >
                        {active && (
                          <motion.span
                            layoutId="sidebar-active"
                            transition={springs.pill}
                            className="absolute inset-0 -z-10 rounded-lg bg-sidebar-primary shadow-[0_0_22px_-4px] shadow-sidebar-primary/70"
                            aria-hidden
                          />
                        )}
                        {hovered === item.href && !active && (
                          <motion.span
                            layoutId="sidebar-hover"
                            transition={springs.pill}
                            className="absolute inset-0 -z-10 rounded-lg bg-sidebar-accent"
                            aria-hidden
                          />
                        )}
                        <Icon className="h-4 w-4 shrink-0" aria-hidden />
                        <AnimatePresence initial={false}>
                          {!compact && (
                            <motion.span {...fade} className="truncate">
                              {item.title}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-3">
          <motion.button
            type="button"
            onClick={logout}
            disabled={isLoggingOut}
            whileTap={{ scale: 0.97 }}
            aria-label={compact ? "Logout" : undefined}
            title={compact ? "Logout" : undefined}
            className={cn(
              "flex min-h-10 w-full items-center gap-3 rounded-lg border border-sidebar-border px-3 py-2.5 text-[13px] font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring disabled:opacity-60",
              compact && "justify-center px-0",
            )}
          >
            {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <LogOut className="h-4 w-4" aria-hidden />}
            {!compact && (isLoggingOut ? "Logging out..." : "Logout")}
          </motion.button>
        </div>
      </div>
    </LayoutGroup>
  );
};

export default SidebarNav;

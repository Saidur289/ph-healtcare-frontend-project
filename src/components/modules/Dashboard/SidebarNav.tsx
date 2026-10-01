"use client";
import { useLogout } from "@/hooks/useLogout";
import { getIconComponent } from "@/lib/iconMapper";
import { cn } from "@/lib/utils";
import { NavSection } from "@/types/dashboard.types";
import { HeartPulse, Loader2, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarNavProps {
  navItems: NavSection[];
  dashboardHome: string;
  onNavigate?: () => void;
}

// "/" and the dashboard home only match exactly; other items also match their sub-pages
const isActivePath = (pathname: string, href: string, dashboardHome: string) =>
  href === "/" || href === dashboardHome
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);

// Navy sidebar from the design: logo, icon + label items, blue pill for the active item,
// Logout in a bordered box at the bottom. Used by the desktop sidebar and the mobile drawer.
const SidebarNav = ({ navItems, dashboardHome, onNavigate }: SidebarNavProps) => {
  const pathname = usePathname();
  const { logout, isLoggingOut } = useLogout();

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 shrink-0 items-center px-5">
        <Link
          href={dashboardHome}
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <HeartPulse className="h-4 w-4" aria-hidden />
          </span>
          <span className="text-base font-semibold tracking-tight text-white">PH Healthcare</span>
        </Link>
      </div>

      <nav aria-label="Dashboard" className="flex-1 space-y-5 overflow-y-auto px-3 py-3">
        {navItems.map((section) => (
          <div key={section.title ?? "main"}>
            {section.title && (
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = isActivePath(pathname, item.href, dashboardHome);
                const Icon = getIconComponent(item.icon);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                          : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-3">
        <button
          type="button"
          onClick={logout}
          disabled={isLoggingOut}
          className="flex w-full items-center gap-3 rounded-lg border border-sidebar-border px-3 py-2.5 text-[13px] font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring disabled:opacity-60"
        >
          {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <LogOut className="h-4 w-4" aria-hidden />}
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );
};

export default SidebarNav;

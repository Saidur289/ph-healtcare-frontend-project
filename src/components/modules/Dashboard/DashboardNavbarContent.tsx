"use client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NavSection } from "@/types/dashboard.types";
import { UserInfo } from "@/types/user.types";
import { Menu, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import AvailabilityToggle from "./AvailabilityToggle";
import NotificationDropdown from "./NotificationDropdown";
import SidebarNav from "./SidebarNav";
import ThemeToggle from "./ThemeToggle";
import UserDropdown from "./UserDropdown";

interface DashboardNavbarProps {
  navItems: NavSection[];
  userInfo: UserInfo;
  dashboardHome: string;
}

type TRoleActions = { search: string; placeholder: string; action: { label: string; href: string } };

const ADMIN_ACTIONS: TRoleActions = {
  search: "/admin/dashboard/doctors-management",
  placeholder: "Search doctors…",
  action: { label: "Add Doctor", href: "/admin/dashboard/doctors-management" },
};

// what the search box searches and what the blue "+" button does, per role
const ROLE_ACTIONS: Record<string, TRoleActions> = {
  DOCTOR: {
    search: "/doctor/dashboard/appointments",
    placeholder: "Search patients, appointments…",
    action: { label: "Add Schedule", href: "/doctor/dashboard/my-schedules" },
  },
  PATIENT: {
    search: "/consultation",
    placeholder: "Search doctors or specialties…",
    action: { label: "Book Appointment", href: "/consultation" },
  },
  ADMIN: ADMIN_ACTIONS,
  SUPER_ADMIN: ADMIN_ACTIONS,
};

const DashboardNavbarContent = ({ dashboardHome, navItems, userInfo }: DashboardNavbarProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [term, setTerm] = useState("");
  const roleActions = ROLE_ACTIONS[userInfo.role] ?? ROLE_ACTIONS.PATIENT;

  const search = (event: FormEvent) => {
    event.preventDefault();
    const value = term.trim().slice(0, 100);
    router.push(value ? `${roleActions.search}?searchTerm=${encodeURIComponent(value)}` : roleActions.search);
  };

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b bg-card px-4 md:px-6">
      {/* mobile: the sidebar becomes a drawer */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open navigation">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 border-none p-0">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <SheetDescription className="sr-only">Dashboard pages</SheetDescription>
          <SidebarNav navItems={navItems} dashboardHome={dashboardHome} onNavigate={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>

      <form role="search" onSubmit={search} className="relative hidden max-w-md flex-1 sm:block">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          maxLength={100}
          placeholder={roleActions.placeholder}
          aria-label="Search"
          className="h-9 w-full rounded-full border border-transparent bg-muted pl-9 pr-4 text-[13px] outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:bg-card"
        />
      </form>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        {userInfo.role === "DOCTOR" && <AvailabilityToggle initial={userInfo.Doctor?.isAvailable ?? true} />}
        <Button asChild size="sm" className="hidden rounded-lg md:inline-flex">
          <Link href={roleActions.action.href}>
            <Plus className="h-4 w-4" aria-hidden />
            {roleActions.action.label}
          </Link>
        </Button>
        <ThemeToggle />
        <NotificationDropdown />
        <UserDropdown userInfo={userInfo} />
      </div>
    </header>
  );
};

export default DashboardNavbarContent;

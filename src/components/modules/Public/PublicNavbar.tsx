"use client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { HeartPulse, LayoutDashboard, Menu } from "lucide-react";
import Link from "next/link";
import { springs } from "@/lib/motion";
import { motion } from "motion/react";
import { usePathname } from "next/navigation";
import { useState } from "react";

const LINKS = [
  { title: "Home", href: "/" },
  { title: "Find Doctors", href: "/consultation" },
  { title: "How it works", href: "/#how-it-works" },
];

const Brand = () => (
  <Link href="/" className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
      <HeartPulse className="h-4 w-4" aria-hidden />
    </span>
    <span className="text-base font-semibold tracking-tight">PH Healthcare</span>
  </Link>
);

// public header; "Dashboard" replaces Login / Sign up when someone is logged in
const PublicNavbar = ({ dashboardHref }: { dashboardHref: string | null }) => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : !href.includes("#") && pathname.startsWith(href));

  const actions = dashboardHref ? (
    <Button asChild size="sm">
      <Link href={dashboardHref}>
        <LayoutDashboard className="h-4 w-4" aria-hidden /> Dashboard
      </Link>
    </Button>
  ) : (
    <>
      <Button asChild size="sm" variant="ghost">
        <Link href="/login">Log in</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/register">Sign up</Link>
      </Button>
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-xl" style={{ viewTransitionName: "app-navbar" }}>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Brand />
        {/* the active page sits on a pill that glides to the new link; a lighter one follows the pointer */}
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex" onMouseLeave={() => setHovered(null)}>
          {LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                onMouseEnter={() => setHovered(link.href)}
                onFocus={() => setHovered(link.href)}
                onBlur={() => setHovered(null)}
                className={cn(
                  "relative isolate rounded-lg px-3 py-2 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span layoutId="public-nav-active" transition={springs.pill} className="absolute inset-0 -z-10 rounded-lg bg-accent" aria-hidden />
                )}
                {hovered === link.href && !active && (
                  <motion.span layoutId="public-nav-hover" transition={springs.pill} className="absolute inset-0 -z-10 rounded-lg bg-muted" aria-hidden />
                )}
                {link.title}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">{actions}</div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="ml-auto md:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 p-5">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SheetDescription className="sr-only">Site pages</SheetDescription>
            <Brand />
            <nav aria-label="Main" className="mt-6 flex flex-col gap-1" onClick={() => setOpen(false)}>
              {LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted">
                  {link.title}
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-2 [&>a]:w-full">{actions}</div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default PublicNavbar;

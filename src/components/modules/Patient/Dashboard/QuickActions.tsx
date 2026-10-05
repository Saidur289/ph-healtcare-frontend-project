"use client";
import { Card } from "@/components/ui/card";
import { springs } from "@/lib/motion";
import { CalendarPlus, ChevronRight, FileText, HeartPulse, KeyRound, LucideIcon } from "lucide-react";
import { LayoutGroup, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";

const QUICK_ACTIONS: { title: string; description: string; href: string; icon: LucideIcon }[] = [
  { title: "Book appointment", description: "Find a doctor and pick a slot", href: "/consultation", icon: CalendarPlus },
  { title: "My prescriptions", description: "Download your prescription PDFs", href: "/dashboard/my-prescriptions", icon: FileText },
  { title: "Health records", description: "Your health data and reports", href: "/dashboard/health-records", icon: HeartPulse },
  { title: "Change password", description: "Keep your account secure", href: "/change-password", icon: KeyRound },
];

// patient shortcuts; a highlight glides to the link under the pointer / keyboard focus
const QuickActions = () => {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <Card className="h-full gap-1 p-2 shadow-xs">
      <p className="px-3 pb-1 pt-3 text-[15px] font-semibold">Quick actions</p>
      <LayoutGroup id="patient-quick-actions">
        <div onMouseLeave={() => setHovered(null)}>
          {QUICK_ACTIONS.map(({ title, description, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onMouseEnter={() => setHovered(href)}
              onFocus={() => setHovered(href)}
              onBlur={() => setHovered(null)}
              className="group relative isolate flex items-center gap-3 rounded-lg px-3 py-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {hovered === href && (
                <motion.span layoutId="quick-action-hover" transition={springs.pill} className="absolute inset-0 -z-10 rounded-lg bg-foreground/[0.04] ring-1 ring-foreground/5" aria-hidden />
              )}
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary transition-transform duration-200 group-hover:scale-105">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium">{title}</span>
                <span className="block truncate text-xs text-muted-foreground">{description}</span>
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
            </Link>
          ))}
        </div>
      </LayoutGroup>
    </Card>
  );
};

export default QuickActions;

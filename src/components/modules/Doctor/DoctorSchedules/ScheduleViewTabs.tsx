"use client";
import { springs } from "@/lib/motion";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { CalendarDays, List } from "lucide-react";
import Link from "next/link";

// Calendar / List switch stored in ?view= so it survives reloads
const ScheduleViewTabs = ({ view }: { view: "calendar" | "list" }) => (
  <div role="tablist" aria-label="Schedule view" className="glass inline-flex rounded-lg p-1">
    {(
      [
        { id: "calendar", label: "Calendar", icon: CalendarDays },
        { id: "list", label: "List", icon: List },
      ] as const
    ).map(({ id, label, icon: Icon }) => (
      <Link
        key={id}
        role="tab"
        aria-selected={view === id}
        href={`/doctor/dashboard/my-schedules?view=${id}`}
        scroll={false}
        className={cn(
          "relative isolate flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
          view === id ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        {view === id && (
          <motion.span layoutId="schedule-view-tab" transition={springs.pill} className="absolute inset-0 -z-10 rounded-md bg-primary" aria-hidden />
        )}
        <Icon className="h-4 w-4" aria-hidden /> {label}
      </Link>
    ))}
  </div>
);

export default ScheduleViewTabs;

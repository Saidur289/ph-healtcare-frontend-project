"use client";
import { cn } from "@/lib/utils";
import { CalendarDays, List } from "lucide-react";
import Link from "next/link";

// Calendar / List switch stored in ?view= so it survives reloads
const ScheduleViewTabs = ({ view }: { view: "calendar" | "list" }) => (
  <div role="tablist" aria-label="Schedule view" className="inline-flex rounded-lg border bg-card p-1">
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
          "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors",
          view === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Icon className="h-4 w-4" aria-hidden /> {label}
      </Link>
    ))}
  </div>
);

export default ScheduleViewTabs;

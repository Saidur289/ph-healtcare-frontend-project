import { cn } from "@/lib/utils";
import { ReactNode } from "react";

const TONE_CLASSES = {
  blue: "bg-info-soft text-primary",
  green: "bg-success-soft text-success",
  teal: "bg-teal-soft text-teal",
  amber: "bg-warning-soft text-warning",
  red: "bg-danger-soft text-destructive",
  gray: "bg-muted text-muted-foreground",
} as const;
export type PillTone = keyof typeof TONE_CLASSES;

// one colour per status value used anywhere in the app
const STATUS_TONES: Record<string, PillTone> = {
  SCHEDULED: "blue",
  INPROGRESS: "teal",
  COMPLETED: "green",
  CANCELED: "red",
  NO_SHOW: "amber",
  PAID: "green",
  UNPAID: "amber",
  EXPIRED: "gray",
  REFUNDED: "gray",
  ACTIVE: "green",
  BLOCKED: "red",
  DELETED: "gray",
};

const LABELS: Record<string, string> = { INPROGRESS: "In progress", NO_SHOW: "No show" };

export const statusLabel = (status: string) =>
  LABELS[status] ?? status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ");

// light tinted badge from the design ("Book Visit", "Video Consult", statuses)
const StatusPill = ({
  status,
  tone,
  children,
  className,
}: {
  status?: string;
  tone?: PillTone;
  children?: ReactNode;
  className?: string;
}) => (
  <span
    className={cn(
      "inline-flex h-6 items-center gap-1 whitespace-nowrap rounded-full px-2.5 text-xs font-medium",
      TONE_CLASSES[tone ?? (status ? STATUS_TONES[status] : undefined) ?? "gray"],
      className,
    )}
  >
    {children ?? (status ? statusLabel(status) : null)}
  </span>
);

export default StatusPill;

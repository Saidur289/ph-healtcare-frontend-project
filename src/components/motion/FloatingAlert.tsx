"use client";
// A floating status card (billing results, prescription updates, ...). It slides in from the
// screen edge, morphs smoothly when its content changes, and can be swiped sideways (drag="x")
// or closed to dismiss. Announced to screen readers: "alert" for problems, "status" otherwise.
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { X, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import type { ReactNode } from "react";

const TONES = {
  info: { bar: "bg-primary", icon: "text-primary" },
  success: { bar: "bg-success", icon: "text-success" },
  danger: { bar: "bg-destructive", icon: "text-destructive" },
  warning: { bar: "bg-warning", icon: "text-warning" },
} as const;

interface FloatingAlertProps {
  show: boolean;
  onDismiss: () => void;
  tone?: keyof typeof TONES;
  icon: LucideIcon;
  iconClassName?: string;
  title: string;
  children?: ReactNode;
  // changes when the content changes (e.g. the state name), so the card morphs between them
  contentKey?: string;
}

export function FloatingAlert({ show, onDismiss, tone = "info", icon: Icon, iconClassName, title, children, contentKey }: FloatingAlertProps) {
  const colors = TONES[tone];
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 500) onDismiss();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          layout
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 140, transition: { duration: 0.18 } }}
          transition={springs.page}
          drag="x"
          dragSnapToOrigin
          dragElastic={0.6}
          onDragEnd={onDragEnd}
          role={tone === "danger" ? "alert" : "status"}
          className="glass fixed inset-x-4 bottom-4 z-[90] flex touch-pan-y items-start gap-3 overflow-hidden rounded-xl p-4 pr-11 text-sm sm:inset-x-auto sm:right-4 sm:w-[26rem]"
        >
          <span className={cn("absolute inset-y-0 left-0 w-1", colors.bar)} aria-hidden />
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={contentKey ?? title}
              className="flex min-w-0 flex-1 items-start gap-3"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6, transition: { duration: 0.1 } }}
              transition={springs.snappy}
            >
              <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", colors.icon, iconClassName)} aria-hidden />
              <div className="min-w-0">
                <p className="font-semibold leading-snug">{title}</p>
                {children && <div className="mt-0.5 text-muted-foreground">{children}</div>}
              </div>
            </motion.div>
          </AnimatePresence>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

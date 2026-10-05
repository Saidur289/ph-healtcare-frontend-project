"use client";
// Floating notifications: they slide in from the screen edge, stack, and can be swiped away
// sideways (drag="x"). The app keeps calling sonner's `toast.success(...)` / `toast.error(...)`;
// this component only replaces how those toasts are drawn.
import { cn } from "@/lib/utils";
import { springs } from "@/lib/motion";
import { CircleCheck, Info, OctagonX, TriangleAlert, X } from "lucide-react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast, useSonner, type ToastT } from "sonner";

const DEFAULT_DURATION = 5000;
const ERROR_DURATION = 8000;
const SWIPE_DISTANCE = 90;
const SWIPE_VELOCITY = 500;

const TONES = {
  success: { icon: CircleCheck, accent: "text-success", bar: "bg-success" },
  error: { icon: OctagonX, accent: "text-destructive", bar: "bg-destructive" },
  warning: { icon: TriangleAlert, accent: "text-warning", bar: "bg-warning" },
  info: { icon: Info, accent: "text-primary", bar: "bg-primary" },
} as const;

const render = (value: ToastT["title"]) => (typeof value === "function" ? value() : value);

function ToastCard({ item, paused }: { item: ToastT; paused: boolean }) {
  const tone = TONES[(item.type as keyof typeof TONES) ?? "info"] ?? TONES.info;
  const Icon = tone.icon;
  const duration = item.duration ?? (item.type === "error" ? ERROR_DURATION : DEFAULT_DURATION);
  const remaining = useRef(duration);
  const startedAt = useRef(0);

  // auto-dismiss, paused while the pointer is over the stack or keyboard focus is inside it
  useEffect(() => {
    if (duration === Infinity) return;
    if (paused) {
      remaining.current -= Date.now() - startedAt.current;
      return;
    }
    startedAt.current = Date.now();
    const timer = setTimeout(() => {
      item.onAutoClose?.(item);
      toast.dismiss(item.id);
    }, Math.max(remaining.current, 0));
    return () => clearTimeout(timer);
  }, [paused, duration, item]);

  const dismiss = () => {
    item.onDismiss?.(item);
    toast.dismiss(item.id);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > SWIPE_DISTANCE || Math.abs(info.velocity.x) > SWIPE_VELOCITY) dismiss();
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: 64, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 120, scale: 0.96, transition: { duration: 0.18 } }}
      transition={springs.page}
      drag="x"
      dragSnapToOrigin
      dragElastic={0.6}
      onDragEnd={onDragEnd}
      whileDrag={{ cursor: "grabbing" }}
      className="glass pointer-events-auto relative flex w-full touch-pan-y items-start gap-3 overflow-hidden rounded-xl p-4 pr-11 text-sm text-foreground"
      role={item.type === "error" ? "alert" : "status"}
    >
      <span className={cn("absolute inset-y-0 left-0 w-1", tone.bar)} aria-hidden />
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", tone.accent)} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="font-medium leading-snug">{render(item.title)}</p>
        {item.description && <p className="mt-0.5 text-muted-foreground">{render(item.description)}</p>}
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss notification"
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </motion.li>
  );
}

export function MotionToaster() {
  const { toasts } = useSonner();
  const [paused, setPaused] = useState(false);
  // sonner keeps the newest first: newest on top, at most 4 on screen
  const visible = toasts.filter((t) => !t.delete).slice(0, 4);

  return (
    <section aria-label="Notifications" aria-live="polite" className="pointer-events-none fixed inset-x-4 top-4 z-[100] sm:inset-x-auto sm:right-4 sm:w-96">
      <ol
        className="flex flex-col gap-2"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((item) => (
            <ToastCard key={item.id} item={item} paused={paused} />
          ))}
        </AnimatePresence>
      </ol>
    </section>
  );
}

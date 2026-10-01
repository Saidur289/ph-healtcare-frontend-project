"use client";
import { setAvailabilityAction } from "@/app/_actions/dashboard.actions";
import { cn } from "@/lib/utils";
import { useOptimistic, useState, useTransition } from "react";
import { toast } from "sonner";

// green "Available" switch from the design (doctor only)
const AvailabilityToggle = ({ initial }: { initial: boolean }) => {
  const [isAvailable, setIsAvailable] = useState(initial);
  const [optimistic, setOptimistic] = useOptimistic(isAvailable);
  const [pending, startTransition] = useTransition();

  const toggle = () =>
    startTransition(async () => {
      const next = !optimistic;
      setOptimistic(next);
      const result = await setAvailabilityAction(next);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      setIsAvailable(result.isAvailable ?? next);
      toast.success(result.message);
    });

  return (
    <button
      type="button"
      role="switch"
      aria-checked={optimistic}
      aria-label="Available for consultations"
      onClick={toggle}
      disabled={pending}
      className={cn(
        "flex items-center gap-2 rounded-full border px-2 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-3",
        optimistic ? "border-success/30 bg-success-soft text-success" : "bg-muted text-muted-foreground",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "relative inline-flex h-4 w-7 shrink-0 rounded-full transition-colors",
          optimistic ? "bg-success" : "bg-muted-foreground/40",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform",
            optimistic ? "translate-x-3.5" : "translate-x-0.5",
          )}
        />
      </span>
      <span className="hidden sm:inline">{optimistic ? "Available" : "Away"}</span>
    </button>
  );
};

export default AvailabilityToggle;

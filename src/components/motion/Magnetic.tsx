"use client";
import { springs } from "@/lib/motion";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

// Magnetic pull for primary CTAs: when the mouse comes within `radius` px of the element, it drifts
// toward the pointer (at most `strength` px) and springs back when the pointer leaves.
// Mouse only; off with reduced motion. Wrap the button: <Magnetic><Button .../></Magnetic>
export function Magnetic({ children, radius = 90, strength = 10, className }: { children: ReactNode; radius?: number; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), springs.follow);
  const y = useSpring(useMotionValue(0), springs.follow);

  useEffect(() => {
    if (reduce) return;
    const onMove = (event: PointerEvent) => {
      const el = ref.current;
      if (!el || event.pointerType !== "mouse") return;
      const rect = el.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      // distance from the element's edge, not its centre
      const outside = Math.hypot(Math.max(Math.abs(dx) - rect.width / 2, 0), Math.max(Math.abs(dy) - rect.height / 2, 0));
      if (outside > radius) {
        x.set(0);
        y.set(0);
        return;
      }
      const pull = 1 - outside / radius;
      x.set((dx / (rect.width / 2 + radius)) * strength * pull);
      y.set((dy / (rect.height / 2 + radius)) * strength * pull);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, radius, strength, x, y]);

  return (
    <motion.span ref={ref} style={{ x, y }} className={className ?? "inline-flex"}>
      {children}
    </motion.span>
  );
}

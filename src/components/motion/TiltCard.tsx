"use client";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type HTMLMotionProps } from "motion/react";
import { useState, type PointerEvent } from "react";

// 3D parallax tilt for high-value cards: the card leans toward the pointer and a soft light follows it.
// Off for touch / pen input and when the visitor prefers reduced motion.
export function TiltCard({ className, children, max = 6, style, ...props }: HTMLMotionProps<"div"> & { max?: number }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(false);
  // pointer position inside the card, -0.5 .. 0.5
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), springs.follow);
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), springs.follow);
  const glareX = useTransform(px, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(py, [-0.5, 0.5], ["0%", "100%"]);
  const glare = useTransform([glareX, glareY], ([x, y]) => `radial-gradient(420px circle at ${x} ${y}, rgb(255 255 255 / 0.14), transparent 45%)`);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduce || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width - 0.5);
    py.set((event.clientY - rect.top) / rect.height - 0.5);
    setActive(true);
  };
  const reset = () => {
    px.set(0);
    py.set(0);
    setActive(false);
  };

  return (
    <motion.div
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      style={{ rotateX: reduce ? 0 : rotateX, rotateY: reduce ? 0 : rotateY, transformPerspective: 900, ...style }}
      className={cn("relative will-change-transform [transform-style:preserve-3d]", className)}
      {...props}
    >
      {children as React.ReactNode}
      {!reduce && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-200"
          style={{ background: glare, opacity: active ? 1 : 0 }}
        />
      )}
    </motion.div>
  );
}

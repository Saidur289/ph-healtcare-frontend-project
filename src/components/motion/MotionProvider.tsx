"use client";
import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

// reducedMotion="user": when the visitor's system asks for reduced motion, Framer Motion skips
// movement (transforms, layout) and keeps only opacity changes, everywhere in the app.
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

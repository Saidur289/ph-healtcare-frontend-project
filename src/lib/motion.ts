// One motion language for the whole app. Components import these instead of inventing their own
// curves, so everything moves with the same physics. All of it is switched off for people who ask
// their system for reduced motion (MotionProvider + the CSS in globals.css).
import type { Transition, Variants } from "motion/react";

export const springs = {
  // page entrances and large surfaces (the spec's stiffness 120 / damping 20)
  page: { type: "spring", stiffness: 120, damping: 20 },
  // sliding highlights behind nav items: fast, no wobble
  pill: { type: "spring", stiffness: 500, damping: 40, mass: 0.8 },
  // cards that morph between collapsed and expanded
  morph: { type: "spring", stiffness: 260, damping: 30 },
  // magnetic buttons and tilt: soft follow
  follow: { type: "spring", stiffness: 260, damping: 18, mass: 0.6 },
  // small UI responses (hover, press)
  snappy: { type: "spring", stiffness: 400, damping: 30 },
} satisfies Record<string, Transition>;

// lists, grids and tables cascade in (spec: staggerChildren 0.05)
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: springs.page },
};

// a single block fading up into place
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: springs.page },
};

// press feedback for anything clickable
export const pressable = {
  whileTap: { scale: 0.97 },
  transition: springs.snappy,
} as const;

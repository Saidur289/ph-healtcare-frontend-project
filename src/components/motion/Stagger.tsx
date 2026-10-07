"use client";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/motion";
import { motion, type HTMLMotionProps } from "motion/react";

// Children cascade into view one after another (staggerChildren 0.05).
// <Stagger as="ul"> ... <StaggerItem as="li"> ... </Stagger>
// inView: start when the list scrolls into view (once) instead of on mount — for content below the fold.
type TTag = "div" | "ul" | "ol" | "li" | "section" | "tbody" | "tr" | "dl";

const VIEWPORT = { once: true, amount: 0.15 } as const;

export function Stagger({ as = "div", inView = false, ...props }: HTMLMotionProps<"div"> & { as?: TTag; inView?: boolean }) {
  const Component = motion[as] as typeof motion.div;
  const trigger = inView ? { whileInView: "show", viewport: VIEWPORT } : { animate: "show" };
  return <Component variants={staggerContainer} initial="hidden" {...trigger} {...props} />;
}

export function StaggerItem({ as = "div", ...props }: HTMLMotionProps<"div"> & { as?: TTag }) {
  const Component = motion[as] as typeof motion.div;
  return <Component variants={staggerItem} {...props} />;
}

// one block that rises into view as it is scrolled to (once)
export function Reveal({ as = "div", ...props }: HTMLMotionProps<"div"> & { as?: TTag }) {
  const Component = motion[as] as typeof motion.div;
  return <Component variants={fadeUp} initial="hidden" whileInView="show" viewport={VIEWPORT} {...props} />;
}

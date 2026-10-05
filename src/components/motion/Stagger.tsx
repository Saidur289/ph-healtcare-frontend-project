"use client";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { motion, type HTMLMotionProps } from "motion/react";

// Children cascade into view one after another (staggerChildren 0.05).
// <Stagger as="ul"> ... <StaggerItem as="li"> ... </Stagger>
type TTag = "div" | "ul" | "ol" | "li" | "section" | "tbody" | "tr";

export function Stagger({ as = "div", ...props }: HTMLMotionProps<"div"> & { as?: TTag }) {
  const Component = motion[as] as typeof motion.div;
  return <Component variants={staggerContainer} initial="hidden" animate="show" {...props} />;
}

export function StaggerItem({ as = "div", ...props }: HTMLMotionProps<"div"> & { as?: TTag }) {
  const Component = motion[as] as typeof motion.div;
  return <Component variants={staggerItem} {...props} />;
}

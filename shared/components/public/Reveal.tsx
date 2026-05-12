"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import { PUBLIC_MOTION_DURATION, PUBLIC_MOTION_EASE } from "./motion-tokens";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  once?: boolean;
};

export default function Reveal({
  children,
  className,
  delay = 0,
  duration = PUBLIC_MOTION_DURATION.base,
  y = 24,
  once = true,
}: RevealProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={clsx(className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.25 }}
      transition={{ duration, delay, ease: PUBLIC_MOTION_EASE }}
    >
      {children}
    </motion.div>
  );
}

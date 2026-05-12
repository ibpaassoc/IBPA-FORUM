"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import { PUBLIC_MOTION_EASE } from "./motion-tokens";

type FloatingElementProps = {
  children: ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
};

export default function FloatingElement({
  children,
  className,
  amplitude = 10,
  duration = 7,
}: FloatingElementProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={clsx(className)}
      animate={{ y: [0, -amplitude, 0] }}
      transition={{
        duration,
        ease: PUBLIC_MOTION_EASE,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "loop",
      }}
    >
      {children}
    </motion.div>
  );
}

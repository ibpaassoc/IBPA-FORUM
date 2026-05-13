"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import { PUBLIC_MOTION_DURATION, PUBLIC_MOTION_EASE } from "./motion-tokens";

type HoverCardProps = {
  children: ReactNode;
  className?: string;
  lift?: number;
  scale?: number;
};

export default function HoverCard({
  children,
  className,
  lift = -6,
  scale = 1.01,
}: HoverCardProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={clsx(className)}
      whileHover={{ y: lift, scale }}
      transition={{
        duration: PUBLIC_MOTION_DURATION.fast,
        ease: PUBLIC_MOTION_EASE,
      }}
    >
      {children}
    </motion.div>
  );
}

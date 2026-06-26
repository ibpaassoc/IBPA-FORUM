"use client";

import type { ReactNode } from "react";
import { LayoutGroup, motion } from "framer-motion";
import { PUBLIC_MOTION_EASE, PUBLIC_MOTION_DURATION } from "./motion-tokens";

type PageMotionShellProps = {
  children: ReactNode;
  className?: string;
  layoutId?: string;
};

export const pageMotionTransition = {
  duration: PUBLIC_MOTION_DURATION.base,
  ease: PUBLIC_MOTION_EASE,
} as const;

export default function PageMotionShell({
  children,
  className = "page-shell",
  layoutId = "page-motion-shell",
}: PageMotionShellProps) {
  return (
    <LayoutGroup id={layoutId}>
      <motion.main
        layout="position"
        transition={pageMotionTransition}
        className={className}
      >
        {children}
      </motion.main>
    </LayoutGroup>
  );
}

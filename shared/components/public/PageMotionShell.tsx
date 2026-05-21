"use client";

import type { ReactNode } from "react";
import { LayoutGroup, motion } from "framer-motion";

type PageMotionShellProps = {
  children: ReactNode;
  className?: string;
  layoutId?: string;
};

export const pageMotionTransition = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1],
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

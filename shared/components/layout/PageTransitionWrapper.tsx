"use client";

import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

const pageVariants = {
  enter: {
    opacity: 0,
    y: 8,
  },
  center: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -6,
  },
};

export default function PageTransitionWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <div className="relative grid w-full grid-cols-1 overflow-x-clip overflow-y-visible">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={pathname}
          variants={pageVariants}
          initial={shouldReduceMotion ? false : "enter"}
          animate="center"
          exit={shouldReduceMotion ? undefined : "exit"}
          transition={{
            duration: 0.22,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="col-start-1 row-start-1 min-h-screen w-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

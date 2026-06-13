"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useRef, useEffect } from "react";

// Nav order left → right. Index determines which way pages swipe.
const ROUTE_ORDER = [
  "/",
  "/categories",
  "/jury",
  "/jury/register",
  "/jury/login",
  "/grand-prix",
  "/apply",
  "/apply/jury",
  "/apply/success",
  "/apply/cancel",
];

function getRouteIndex(path: string): number {
  const exact = ROUTE_ORDER.indexOf(path);
  if (exact !== -1) return exact;
  for (let i = ROUTE_ORDER.length - 1; i >= 0; i--) {
    if (ROUTE_ORDER[i] !== "/" && path.startsWith(ROUTE_ORDER[i])) return i;
  }
  return -1;
}

export default function PageTransitionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // prevPathRef holds the previous pathname synchronously at render time.
  const prevPathRef = useRef<string>(pathname);

  const prevIndex = getRouteIndex(prevPathRef.current);
  const nextIndex = getRouteIndex(pathname);
  // Going to a lower-index route (left in nav) → direction -1, new page enters from left.
  // Going to a higher-index route (right in nav) → direction +1, new page enters from right.
  const direction =
    prevIndex !== -1 && nextIndex !== -1 && nextIndex < prevIndex ? -1 : 1;

  useEffect(() => {
    prevPathRef.current = pathname;
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    // overflow-hidden clips the sliding pages; relative is the anchor for popLayout's absolute exit.
    <div className="relative w-full overflow-hidden">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={pathname}
          className="min-h-screen w-full"
          initial={{ x: `${direction * 100}%` }}
          animate={{ x: 0 }}
          exit={{ x: `${direction * -100}%` }}
          transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

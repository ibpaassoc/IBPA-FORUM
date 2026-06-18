"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type RouteMatch = {
  index: number;
  prefix: string;
  exact?: boolean;
};

const ROUTE_INDEXES: RouteMatch[] = [
  { index: 6, prefix: "/jury/dashboard" },
  { index: 6, prefix: "/jury/login" },
  { index: 6, prefix: "/jury/register" },
  { index: 6, prefix: "/login" },
  { index: 6, prefix: "/register" },
  { index: 5, prefix: "/apply/jury" },
  { index: 4, prefix: "/apply" },
  { index: 3, prefix: "/grand-prix" },
  { index: 2, prefix: "/jury" },
  { index: 1, prefix: "/categories" },
  { index: 0, prefix: "/", exact: true },
];

const pageVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "14%" : "-14%",
    opacity: 0,
    scale: 0.985,
  }),
  center: {
    x: "0%",
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-14%" : "14%",
    opacity: 0,
    scale: 0.985,
  }),
};

function getRouteIndex(pathname: string): number {
  const matchedRoute = ROUTE_INDEXES.find(({ prefix, exact }) =>
    exact ? pathname === prefix : pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  return matchedRoute?.index ?? 0;
}

export default function PageTransitionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [previousPathname, setPreviousPathname] = useState(pathname);

  const previousIndex = getRouteIndex(previousPathname);
  const nextIndex = getRouteIndex(pathname);
  const direction = nextIndex > previousIndex ? 1 : nextIndex < previousIndex ? -1 : 1;

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className="relative grid grid-cols-1 w-full overflow-x-clip overflow-y-visible">
      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.div
          key={pathname}
          custom={direction}
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            duration: 0.55,
            ease: [0.22, 1, 0.36, 1],
          }}
          onAnimationComplete={() => {
            if (previousPathname !== pathname) {
              setPreviousPathname(pathname);
            }
          }}
          className="col-start-1 row-start-1 min-h-screen w-full will-change-transform"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

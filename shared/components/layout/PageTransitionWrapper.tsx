"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function PageTransitionWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <div className="min-h-screen w-full overflow-x-clip overflow-y-visible">
      {children}
    </div>
  );
}

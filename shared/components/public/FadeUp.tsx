"use client";

import type { ReactNode } from "react";
import Reveal from "./Reveal";
import { PUBLIC_MOTION_DURATION } from "./motion-tokens";

type FadeUpProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
};

export default function FadeUp({
  children,
  className,
  delay = 0,
  once = true,
}: FadeUpProps) {
  return (
    <Reveal
      className={className}
      delay={delay}
      duration={PUBLIC_MOTION_DURATION.base}
      y={20}
      once={once}
    >
      {children}
    </Reveal>
  );
}

import type { ReactNode } from "react";
import clsx from "clsx";

type AnimatedRevealProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
};

export default function AnimatedReveal({
  children,
  className,
  delayMs = 0,
}: AnimatedRevealProps) {
  return (
    <div
      className={clsx("motion-safe:animate-[fadeUp_0.7s_ease_both]", className)}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}

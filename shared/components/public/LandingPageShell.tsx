import type { ReactNode } from "react";
import clsx from "clsx";

type LandingPageShellProps = {
  children: ReactNode;
  className?: string;
};

export default function LandingPageShell({
  children,
  className,
}: LandingPageShellProps) {
  return <main className={clsx("landing-page-shell", className)}>{children}</main>;
}

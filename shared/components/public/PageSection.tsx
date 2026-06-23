import type { ReactNode } from "react";
import { SectionShell } from "./PremiumPrimitives";

type PageSectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  surface?: "default" | "tint" | "mist";
  padded?: boolean;
};

export default function PageSection({
  id,
  children,
  className,
  surface = "default",
  padded = true,
}: PageSectionProps) {
  return (
    <SectionShell id={id} className={className} surface={surface} padded={padded}>
      {children}
    </SectionShell>
  );
}

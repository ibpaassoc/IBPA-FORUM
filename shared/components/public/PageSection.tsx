import type { ReactNode } from "react";
import clsx from "clsx";

type PageSectionProps = {
  children: ReactNode;
  className?: string;
  surface?: "default" | "tint" | "mist";
  padded?: boolean;
};

export default function PageSection({
  children,
  className,
  surface = "default",
  padded = true,
}: PageSectionProps) {
  const surfaceClass =
    surface === "tint"
      ? "bg-(--surface-tint)"
      : surface === "mist"
        ? "bg-(--color-mist)"
        : "bg-transparent";

  return (
    <section className={clsx(surfaceClass, className)}>
      <div className={clsx("page-section", padded && "page-section-pad")}>{children}</div>
    </section>
  );
}

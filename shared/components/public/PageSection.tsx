import type { ReactNode } from "react";
import clsx from "clsx";

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
  const surfaceClass =
    surface === "tint"
      ? "bg-(--surface-tint)"
      : surface === "mist"
        ? "bg-(--color-mist)"
        : "bg-transparent";

  return (
    <section id={id} className={clsx(surfaceClass, className)}>
      <div className={clsx("page-section", padded && "page-section-pad")}>{children}</div>
    </section>
  );
}

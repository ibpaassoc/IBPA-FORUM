import type { ReactNode } from "react";
import clsx from "clsx";
import PageSection from "./PageSection";
import SectionHeading from "./SectionHeading";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  media?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export default function PageHero({
  eyebrow,
  title,
  description,
  media,
  actions,
  className,
}: PageHeroProps) {
  return (
    <PageSection className={clsx("pt-[clamp(76px,10vh,96px)]", className)} surface="tint">
      <div className="grid gap-(--space-xl) lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          actions={actions}
          className="max-w-2xl"
        />
        {media ? <div>{media}</div> : null}
      </div>
    </PageSection>
  );
}

"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import PageSection from "./PageSection";
import SectionHeading from "./SectionHeading";
import EditorialPhotoCard from "./EditorialPhotoCard";
import FadeUp from "./FadeUp";
import StaggerContainer from "./StaggerContainer";

type EditorialPhotoItem = {
  src: string;
  alt: string;
  title?: string;
  description?: string;
  eyebrow?: string;
};

type EditorialPhotoSectionProps = {
  eyebrow: string;
  title: string;
  description?: string;
  primary: EditorialPhotoItem;
  secondary: EditorialPhotoItem[];
  className?: string;
  aside?: ReactNode;
};

export default function EditorialPhotoSection({
  eyebrow,
  title,
  description,
  primary,
  secondary,
  className,
  aside,
}: EditorialPhotoSectionProps) {
  return (
    <PageSection className={className}>
      <SectionHeading eyebrow={eyebrow} title={title} description={description} />
      <div className="mt-[var(--space-lg)] grid gap-[var(--space-md)] xl:grid-cols-[1.3fr_0.7fr]">
        <FadeUp>
          <EditorialPhotoCard
            src={primary.src}
            alt={primary.alt}
            title={primary.title}
            description={primary.description}
            eyebrow={primary.eyebrow}
            aspect="landscape"
            overlay="soft"
            className="h-full"
          />
        </FadeUp>

        <div className="grid gap-[var(--space-md)]">
          <StaggerContainer stagger={0.12}>
            {secondary.slice(0, 2).map((item) => (
              <EditorialPhotoCard
                key={item.src}
                src={item.src}
                alt={item.alt}
                title={item.title}
                description={item.description}
                eyebrow={item.eyebrow}
                aspect="portrait"
                overlay="soft"
              />
            ))}
          </StaggerContainer>
          {aside ? (
            <FadeUp>
              <div className={clsx("page-card rounded-[var(--radius)] p-[var(--space-md)]")}>{aside}</div>
            </FadeUp>
          ) : null}
        </div>
      </div>
    </PageSection>
  );
}

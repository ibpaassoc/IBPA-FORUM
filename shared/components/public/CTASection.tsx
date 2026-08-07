import Link from "next/link";
import type { ReactNode } from "react";
import PageSection from "./PageSection";
import SectionHeading from "./SectionHeading";

type CTASectionProps = {
  eyebrow?: string;
  title: string;
  description: string;
  primary: { href: string; label: string };
  secondary?: { href: string; label: string };
  extra?: ReactNode;
};

export default function CTASection({
  eyebrow,
  title,
  description,
  primary,
  secondary,
  extra,
}: CTASectionProps) {
  return (
    <PageSection surface="tint">
      <div className="page-card rounded-[var(--radius-lg)] px-[var(--space-xl)] py-[var(--space-xl)]">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />
        <div className="mt-[var(--space-md)] flex flex-wrap items-center gap-3">
          <Link href={primary.href} className="ibpa-button ibpa-button-primary">
            {primary.label}
          </Link>
          {secondary ? (
            <Link href={secondary.href} className="ibpa-button ibpa-button-ghost">
              {secondary.label}
            </Link>
          ) : null}
        </div>
        {extra ? <div className="mt-[var(--space-md)]">{extra}</div> : null}
      </div>
    </PageSection>
  );
}

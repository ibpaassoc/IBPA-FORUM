import Link from "next/link";
import { Award, BadgeCheck, ClipboardCheck, CreditCard, FileText, Search, ShieldCheck, Users } from "lucide-react";
import { getPublicJuryMembers } from "@/features/jury/server/queries";
import PublicJuryGrid from "./PublicJuryGrid";
import {
  CTASection,
  FeatureCard,
  IconBadge,
  PageHero,
  PageSection,
  SectionHeading,
} from "@/shared/components/public";

const steps = [
  { icon: FileText, title: "Apply", text: "Submit your professional profile and expertise areas." },
  { icon: Search, title: "Get approved", text: "IBPA reviews your credentials for category alignment." },
  { icon: CreditCard, title: "Confirm registration", text: "Approved judges complete registration and payment." },
];

const benefits = [
  { icon: Award, title: "Official recognition", description: "Be listed as an IBPA judge and represent industry standards." },
  { icon: ShieldCheck, title: "Trusted framework", description: "Judge inside a structured and transparent scoring model." },
  { icon: Users, title: "Professional network", description: "Join a global community of respected beauty professionals." },
  { icon: BadgeCheck, title: "Credibility boost", description: "Strengthen your professional profile through official jury status." },
];

export default async function JuryPagePremium() {
  const juryMembers = await getPublicJuryMembers();

  return (
    <main className="page-shell">
      <PageHero
        eyebrow="IBPA Jury"
        title="Become an Official IBPA Judge"
        description="Join a premium judging council built on professionalism, fairness, and category-specific expertise."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link href="/apply/jury" className="ibpa-button ibpa-button-primary">
              Apply as Judge
            </Link>
            <Link href="/jury/register" className="ibpa-button ibpa-button-ghost">
              Jury Account
            </Link>
          </div>
        }
      />

      <PageSection>
        <SectionHeading eyebrow="Jury Process" title="A clear 3-step application path" />
        <div className="mt-(--space-lg) grid gap-(--space-md) md:grid-cols-3">
          {steps.map((step) => (
            <FeatureCard
              key={step.title}
              icon={<IconBadge icon={step.icon} />}
              title={step.title}
              description={step.text}
            />
          ))}
        </div>
      </PageSection>

      <PageSection surface="tint">
        <SectionHeading
          eyebrow="Benefits"
          title="Why professionals join the jury panel"
          description="Contribute to high-standard judging while growing your professional visibility."
        />
        <div className="mt-(--space-lg) grid gap-(--space-md) md:grid-cols-2">
          {benefits.map((item) => (
            <FeatureCard
              key={item.title}
              icon={<IconBadge icon={item.icon} />}
              title={item.title}
              description={item.description}
            />
          ))}
        </div>
      </PageSection>

      {juryMembers.length > 0 ? (
        <PageSection>
          <SectionHeading
            eyebrow="Approved Jury"
            title="Current IBPA Jury Members"
            description="A live roster of approved judges participating in the championship."
          />
          <div className="mt-(--space-lg)">
            <PublicJuryGrid members={juryMembers} />
          </div>
        </PageSection>
      ) : null}

      <CTASection
        eyebrow="Jury Council"
        title="Bring your expertise to the IBPA stage"
        description="Apply to become an official judge and contribute to fair, professional award decisions."
        primary={{ href: "/apply/jury", label: "Start Jury Application" }}
        secondary={{ href: "/jury/login", label: "Jury Login" }}
        extra={
          <div className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
            <IconBadge icon={ClipboardCheck} size={20} />
            Approval required before registration payment.
          </div>
        }
      />
    </main>
  );
}

import Link from "next/link";
import {
  Award,
  BadgeCheck,
  ClipboardCheck,
  CreditCard,
  FileText,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { getPublicJuryMembers } from "@/features/jury/server/queries";
import {
  EditorialHero,
  EditorialPhotoCard,
  FeaturedStorySection,
  IconBadge,
  PremiumCTA,
  ProcessTimeline,
  SectionHeading,
  StaggerContainer,
} from "@/shared/components/public";
import PublicJuryGrid from "./PublicJuryGrid";

export default async function JuryPagePremium() {
  const juryMembers = await getPublicJuryMembers();

  return (
    <main className="page-shell">
      <EditorialHero
        eyebrow="IBPA Jury Council"
        title="Become an Official IBPA Judge"
        description="A premium judging council built for fairness, expertise, and global credibility."
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
        media={
          <div className="grid gap-[var(--space-md)]">
            <EditorialPhotoCard
              src="/images/curated/jury_editorial.jpg"
              alt="Jury hero leadership portrait"
              aspect="landscape"
              overlay="soft"
              title="Leadership, trust, and independent standards"
              priority
            />
            <div className="grid gap-[var(--space-md)] md:grid-cols-2">
              <EditorialPhotoCard
                src="/images/events/DSC00452.jpg"
                alt="Jury collaboration close-up"
                aspect="square"
                overlay="soft"
              />
              <EditorialPhotoCard
                src="/images/events/DSC00947.jpg"
                alt="Judge reviewing application materials"
                aspect="square"
                overlay="soft"
              />
            </div>
          </div>
        }
        floatingCard={
          <article className="page-card rounded-[var(--radius)] p-[var(--space-md)]">
            <p className="text-[0.67rem] uppercase tracking-[0.2em] text-[var(--color-hover)]">Credibility</p>
            <p className="mt-1 font-[var(--font-title-family)] text-[clamp(1.6rem,2.1vw,2.2rem)] leading-[1.1] text-[var(--color-ink)]">
              5+ years
            </p>
            <p className="mt-2 text-sm leading-[1.7] text-[var(--color-ink-soft)]">
              Every judge must demonstrate proven professional experience and category expertise.
            </p>
          </article>
        }
      />

      <ProcessTimeline
        eyebrow="Jury Process"
        title="A connected 3-step application journey"
        description="Clear progression from submission to official panel activation."
        steps={[
          {
            id: "1",
            icon: <IconBadge icon={FileText} />,
            title: "Apply",
            text: "Submit your profile, experience details, and required professional materials.",
          },
          {
            id: "2",
            icon: <IconBadge icon={Search} />,
            title: "Get approved",
            text: "IBPA evaluates your expertise and confirms your fit for designated directions.",
          },
          {
            id: "3",
            icon: <IconBadge icon={CreditCard} />,
            title: "Confirm registration",
            text: "Approved candidates complete the official registration payment and join the panel.",
          },
        ]}
      />

      <section className="section-rhythm-tight">
        <div className="page-section">
          <SectionHeading
            eyebrow="Judge Benefits"
            title="Why experts join the IBPA judging council"
            description="A serious professional role with visible impact and international recognition."
          />
          <StaggerContainer className="mt-[var(--space-lg)] grid gap-[var(--space-md)] md:grid-cols-2">
            {[
              {
                title: "Official recognition",
                text: "Be listed as a verified IBPA jury member and represent industry standards.",
                icon: Award,
              },
              {
                title: "Trusted framework",
                text: "Evaluate submissions through a transparent and structured judging process.",
                icon: ShieldCheck,
              },
              {
                title: "Professional network",
                text: "Join an international community of beauty leaders and educators.",
                icon: Users,
              },
              {
                title: "Profile credibility",
                text: "Strengthen your professional authority through an official championship role.",
                icon: BadgeCheck,
              },
            ].map((item) => (
              <article key={item.title} className="page-card rounded-[var(--radius)] p-[var(--space-lg)]">
                <IconBadge icon={item.icon} />
                <h3 className="mt-[var(--space-sm)] text-[clamp(1.2rem,2vw,1.6rem)] leading-[1.2] text-[var(--color-ink)]">
                  {item.title}
                </h3>
                <p className="mt-[var(--space-xs)] text-sm leading-[1.75] text-[var(--color-ink-soft)]">{item.text}</p>
              </article>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <FeaturedStorySection
        eyebrow="Credibility Statement"
        title="Every score should reflect both artistry and professional integrity."
        description="IBPA judges are selected for expertise, neutrality, and commitment to fair evaluation."
        quote="Judging is not only about outcomes. It is about trust in the process."
        media={
          <EditorialPhotoCard
            src="/images/community/DSC00365.jpg"
            alt="Jury leadership and community photo"
            aspect="landscape"
            overlay="soft"
          />
        }
      />

      {juryMembers.length > 0 ? (
        <section className="section-rhythm-tight">
          <div className="page-section">
            <SectionHeading
              eyebrow="Approved Jury"
              title="Current IBPA Jury Members"
              description="A live roster of approved judges participating in the championship."
            />
            <div className="mt-[var(--space-lg)]">
              <PublicJuryGrid members={juryMembers} />
            </div>
          </div>
        </section>
      ) : null}

      <PremiumCTA
        eyebrow="Jury Council"
        title="Bring your expertise to the IBPA stage"
        description="Apply to become an official judge and contribute to fair, professional award decisions."
        primary={{ href: "/apply/jury", label: "Start Jury Application" }}
        secondary={{ href: "/jury/login", label: "Jury Login" }}
        aside={
          <div className="inline-flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
            <IconBadge icon={ClipboardCheck} size={20} />
            Approval is required before registration payment.
          </div>
        }
      />
    </main>
  );
}

import Link from "next/link";
import { PageCard, PageHero, PageSection, PageShell } from "@/components/layout/PageShell";

const pillars = [
  {
    title: "Not a direct application",
    text: "The Grand Prix is chosen from category winners rather than through a separate public entry path.",
  },
  {
    title: "Only in strong championship years",
    text: "The full jury considers the Grand Prix only when at least five categories produce award recipients.",
  },
  {
    title: "Selected by the full jury",
    text: "This final distinction represents broad excellence, consistency, and cross-category prestige.",
  },
];

const criteria = [
  "Competitive strength across multiple live categories",
  "Consistent excellence in technical quality and professional presentation",
  "Industry impact beyond a single specialty or moment",
  "A winner whose work meaningfully represents the championship year",
];

const steps = [
  {
    number: "01",
    title: "Category judging closes",
    text: "The jury completes category evaluations first so every winner is established on its own merits.",
  },
  {
    number: "02",
    title: "Eligibility is checked",
    text: "IBPA confirms that at least five categories produced official award recipients before Grand Prix review begins.",
  },
  {
    number: "03",
    title: "The full jury reconsiders finalists",
    text: "Only category winners are reviewed again, this time for overall championship distinction.",
  },
  {
    number: "04",
    title: "One standout winner is chosen",
    text: "The final selection reflects the strongest all-around representative of the competition year.",
  },
];

const faqs = [
  {
    question: "Can someone apply directly for Grand Prix?",
    answer: "No. Grand Prix is awarded only from the pool of official category winners.",
  },
  {
    question: "Is Grand Prix guaranteed every year?",
    answer: "No. It is considered only when the championship has enough depth, including at least five active winning categories.",
  },
  {
    question: "What makes a winner Grand Prix-level?",
    answer: "The jury looks for broad distinction, consistency, and a result that best represents the strongest work of the season.",
  },
];

export default function GrandPrixPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Grand Prix"
        title="The championship's highest distinction is earned, not entered."
        description="Grand Prix protects the prestige of the overall competition by recognizing an exceptional winner only when the championship year demonstrates enough category depth and competitive strength."
        aside={
          <div className="space-y-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">
              Selection Snapshot
            </p>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Eligibility</p>
              <p className="mt-2 text-lg font-semibold">Category winners only</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Minimum depth</p>
              <p className="mt-2 text-2xl font-semibold">5+ active winning categories</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Decision body</p>
              <p className="mt-2 text-lg font-semibold">Full jury panel</p>
            </div>
          </div>
        }
      >
        <div className="flex flex-wrap gap-4">
          <Link
            href="/categories"
            className="rounded-full border border-white/20 px-7 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-white hover:border-[#d8c27a] hover:text-[#d8c27a]"
          >
            Review Categories
          </Link>
        </div>
      </PageHero>

      <PageSection className="grid gap-4 md:grid-cols-3">
        {pillars.map((item) => (
          <PageCard key={item.title}>
            <p className="page-eyebrow text-[10px]">{item.title}</p>
            <p className="mt-4 text-2xl font-semibold text-white">{item.title}</p>
            <p className="page-copy mt-4 text-sm">{item.text}</p>
          </PageCard>
        ))}
      </PageSection>

      <PageSection className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <PageCard className="p-8">
          <p className="page-eyebrow text-[10px]">Evaluation Lens</p>
          <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
            What the jury is really protecting
          </h2>
          <p className="page-copy mt-4 text-sm">
            Grand Prix exists to make sure the championship&apos;s top honor stays rare,
            credible, and representative. It is not just another trophy layer. It
            is the signal that a particular year produced enough range and excellence
            for one winner to stand above an already strong field.
          </p>
        </PageCard>

        <PageCard className="p-8">
          <p className="page-eyebrow text-[10px]">Core Criteria</p>
          <div className="mt-5 space-y-4">
            {criteria.map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm leading-6 text-[#d9d4ca]">{item}</p>
              </div>
            ))}
          </div>
        </PageCard>
      </PageSection>

      <PageSection>
        <div className="mb-8 max-w-3xl">
          <p className="page-eyebrow">Selection Flow</p>
          <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
            How the Grand Prix decision is made
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-4">
          {steps.map((step) => (
            <PageCard key={step.number}>
              <p className="page-eyebrow text-[10px]">{step.number}</p>
              <p className="mt-4 text-xl font-semibold text-white">{step.title}</p>
              <p className="page-copy mt-4 text-sm">{step.text}</p>
            </PageCard>
          ))}
        </div>
      </PageSection>

      <PageSection>
        <div className="mb-8 max-w-3xl">
          <p className="page-eyebrow">Questions</p>
          <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
            Grand Prix FAQ
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <PageCard key={faq.question} className="p-6">
              <p className="text-lg font-semibold text-white">{faq.question}</p>
              <p className="page-copy mt-3 text-sm">{faq.answer}</p>
            </PageCard>
          ))}
        </div>
      </PageSection>
    </PageShell>
  );
}

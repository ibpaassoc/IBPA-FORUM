import { PageCard, PageSection } from "@/components/layout/PageShell";

const criteria = [
  "Competitive strength across multiple live categories",
  "Consistent excellence in technical quality and professional presentation",
  "Industry impact beyond a single specialty or moment",
  "A winner whose work meaningfully represents the championship year",
];

export default function GrandPrixCriteria() {
  return (
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
  );
}

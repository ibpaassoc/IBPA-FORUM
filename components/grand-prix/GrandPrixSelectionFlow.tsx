import { PageCard, PageSection } from "@/components/layout/PageShell";

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

export default function GrandPrixSelectionFlow() {
  return (
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
  );
}

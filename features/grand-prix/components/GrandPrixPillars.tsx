import { PageCard, PageSection } from "@/shared/components/layout/PageShell";

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

export default function GrandPrixPillars() {
  return (
    <PageSection className="grid gap-4 md:grid-cols-3">
      {pillars.map((item) => (
        <PageCard key={item.title}>
          <p className="page-eyebrow text-[10px]">{item.title}</p>
          <p className="mt-4 text-2xl font-semibold text-white">{item.title}</p>
          <p className="page-copy mt-4 text-sm">{item.text}</p>
        </PageCard>
      ))}
    </PageSection>
  );
}

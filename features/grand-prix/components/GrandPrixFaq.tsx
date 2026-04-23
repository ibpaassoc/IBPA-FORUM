import { PageCard, PageSection } from "@/shared/components/layout/PageShell";

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

export default function GrandPrixFaq() {
  return (
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
  );
}

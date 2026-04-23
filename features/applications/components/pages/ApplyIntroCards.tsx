import { PageCard } from "@/shared/components/layout/PageShell";

export default function ApplyIntroCards() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <PageCard className="rounded-[1.8rem] p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
          Eligibility & Important Notes
        </p>
        <div className="mt-5 space-y-4 text-sm leading-7 text-[#d9d4ca]">
          <p>
            Participation fee: <strong>$50 per category</strong>.
          </p>
          <p>Each category is submitted as a separate application.</p>
          <p>Jury fee rules do not apply to this participant application page.</p>
        </div>
      </PageCard>

      <PageCard className="rounded-[1.8rem] p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
          Before You Start
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {[
            "Prepare your license or certification file.",
            "Choose one category and one specific award.",
            "Gather all portfolio and supporting files for Block B.",
            "Review your portfolio files before uploading.",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-6 text-[#efe6d0]"
            >
              {item}
            </div>
          ))}
        </div>
      </PageCard>
    </div>
  );
}

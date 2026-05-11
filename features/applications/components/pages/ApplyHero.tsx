import { PageHero } from "@/shared/components/layout/PageShell";

export default function ApplyHero({
  heroStats,
}: {
  heroStats: Array<{ label: string; value: string }>;
}) {
  return (
    <PageHero
      eyebrow="Participant Applications"
      title="Apply for the IBPA Beauty Championship"
      description="Submit your official participant entry with category-specific supporting materials and production-ready files for the championship review team."
      aside={
        <div className="space-y-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--color-title-accent)]">
            2026 Timeline
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {heroStats.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
              >
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">
                  {item.label}
                </p>
                <p className="mt-2 text-base font-semibold text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <div className="flex flex-wrap gap-3">
        {heroStats.map((item) => (
          <div
            key={item.label}
            className="rounded-full border border-[rgba(185,217,235,0.24)] bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--color-title-accent)]"
          >
            {item.label}: {item.value}
          </div>
        ))}
      </div>
    </PageHero>
  );
}

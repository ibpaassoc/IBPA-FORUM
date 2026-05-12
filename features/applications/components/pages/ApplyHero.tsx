import EditorialImageCard from "@/shared/components/media/EditorialImageCard";
import { PageHero } from "@/shared/components/layout/PageShell";

export default function ApplyHero({
  heroStats,
}: {
  heroStats: Array<{ label: string; value: string }>;
}) {
  return (
    <PageHero
      eyebrow="Participant Applications"
      title="Apply for the IBPA Beauty Award"
      description="Submit your official participant entry with direction-specific supporting materials and production-ready files for the championship review team."
      asideShellClassName="overflow-hidden border-0 bg-transparent p-0 shadow-none"
      aside={
        <EditorialImageCard
          src="/images/editorial/makeup.jpg"
          alt="Luxury beauty editorial image for the competitor application page"
          eyebrow="Participant applications"
          title="A premium entry point for competitors"
          text="The application experience now feels more aligned with the editorial tone of the site."
          aspectClassName="aspect-[4/5]"
          objectPosition="center 18%"
          sizes="(max-width: 1024px) 100vw, 40vw"
          className="shadow-[0_22px_64px_rgba(12,16,20,0.14)]"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {heroStats.map((item) => (
              <div
                key={item.label}
                className="rounded-[calc(var(--radius)-4px)] border border-white/12 bg-white/10 px-4 py-3 backdrop-blur-[8px]"
              >
                <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-title-accent)]">
                  {item.label}
                </p>
                <p className="mt-2 font-[var(--font-display)] text-[clamp(1rem,2vw,1.35rem)] font-light text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </EditorialImageCard>
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

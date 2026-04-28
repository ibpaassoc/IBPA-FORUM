import Link from "next/link";
import { formatAdminDate } from "@/features/admin/server/view-models";
import JurySignOutButton from "@/features/jury/components/dashboard/JurySignOutButton";
import { PageShell } from "@/shared/components/layout/PageShell";

export default function JuryDashboardPage({
  juryName,
  professionalTitle,
  expertiseAreas,
  applications,
  activeCategory,
  totals,
}: {
  juryName: string;
  professionalTitle: string;
  expertiseAreas: string[];
  applications: Array<{
    id: string;
    fullName: string;
    email: string;
    city: string;
    country: string;
    createdAt: Date;
    category: { name: string };
    award: { name: string };
  }>;
  activeCategory?: string;
  totals: {
    total: number;
    categories: number;
    byCategory: Array<{
      name: string;
      count: number;
    }>;
  };
}) {
  return (
    <PageShell className="px-6 py-10 text-white md:px-10 md:py-12">
      <div className="mx-auto max-w-7xl pt-16">
        <div className="page-panel flex flex-col gap-5 rounded-3xl p-6 md:flex-row md:items-end md:justify-between md:p-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d8c27a]">
              Jury Dashboard
            </p>
            <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">{juryName}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d9d4ca]">
              {professionalTitle}. Review access is limited to the categories you were
              approved to judge.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <JurySignOutButton />
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.035] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d8c27a]">
            Approved Categories
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {expertiseAreas.map((area) => (
              <span
                key={area}
                className="rounded-full border border-white/12 bg-white/3 px-3 py-1 text-xs text-[#d9d4ca]"
              >
                {area}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {[
            { label: "Total Applications", value: totals.total },
            { label: "Approved Categories", value: totals.categories },
            ...totals.byCategory.slice(0, 3).map((item) => ({
              label: item.name,
              value: item.count,
            })),
          ].map((item) => (
            <div key={item.label} className="page-card rounded-2xl bg-white/4.5 p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d8c27a]">
                {item.label}
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">{item.value}</p>
            </div>
          ))}
        </div>

        <section className="page-card mt-6 rounded-3xl p-4 md:p-6">
          <div className="mb-5 flex flex-wrap gap-3">
            {[
              { label: "All Categories", href: "/jury/dashboard", active: !activeCategory },
              ...expertiseAreas.map((area) => ({
                label: area,
                href: `/jury/dashboard?category=${encodeURIComponent(area)}`,
                active: activeCategory === area,
              })),
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`inline-flex rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${
                  item.active
                    ? "border-[#d8c27a]/45 bg-[#d8c27a]/10 text-[#f2df9c]"
                    : "border-white/12 bg-white/3 text-white/75 hover:border-[#d8c27a]/25 hover:text-[#d8c27a]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden grid-cols-[1.25fr_0.95fr_1.1fr_0.9fr_0.7fr] gap-4 border-b border-white/10 px-4 pb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d9d4ca]/65 lg:grid">
            <span>Applicant</span>
            <span>Category</span>
            <span>Award</span>
            <span>Created</span>
            <span>Open</span>
          </div>

          <div className="divide-y divide-white/10">
            {applications.map((application) => (
              <div
                key={application.id}
                className="grid gap-4 px-4 py-5 transition hover:bg-white/2 lg:grid-cols-[1.25fr_0.95fr_1.1fr_0.9fr_0.7fr] lg:items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{application.fullName}</p>
                  <p className="mt-1 text-sm text-[#d9d4ca]/80">{application.email}</p>
                  <p className="mt-1 text-sm text-[#d9d4ca]/80">
                    {application.city}, {application.country}
                  </p>
                </div>

                <div className="text-sm text-[#d9d4ca]">{application.category.name}</div>

                <div className="text-sm text-[#d9d4ca]">{application.award.name}</div>

                <div className="text-sm text-[#d9d4ca]/75">
                  {formatAdminDate(application.createdAt)}
                </div>

                <div>
                  <Link
                    href={`/jury/dashboard/applications/${application.id}`}
                    className="inline-flex items-center justify-center rounded-full bg-[#d8c27a] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-[#e2d093]"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}

            {applications.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-[#d9d4ca]/75">
                No participant applications matched your category access.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </PageShell>
  );
}

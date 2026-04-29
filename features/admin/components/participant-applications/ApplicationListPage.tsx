import Link from "next/link";
import ApplicationStatusBadge from "@/features/admin/components/badges/ApplicationStatusBadge";
import PaymentStatusBadge from "@/features/admin/components/badges/PaymentStatusBadge";
import { logoutAdminAction } from "@/features/admin/actions/auth.actions";
import { formatAdminDate } from "@/features/admin/server/view-models";
import { PageShell } from "@/shared/components/layout/PageShell";

export default function ApplicationListPage({
  applications,
  activeStatus,
  totals,
}: {
  applications: Array<{
    id: string;
    fullName: string;
    email: string;
    city: string;
    country: string;
    status: "DRAFT" | "PAYMENT_PENDING" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
    paymentStatus: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";
    createdAt: Date;
    category: { name: string };
    award: { name: string };
  }>;
  activeStatus?: string;
  totals: {
    total: number;
    paymentPending: number;
    submitted: number;
    underReview: number;
    approved: number;
  };
}) {
  return (
    <PageShell className="px-6 py-10 text-white md:px-10 md:py-12">
      <div className="mx-auto max-w-7xl pt-16">
        <div className="page-panel flex flex-col gap-5 rounded-3xl p-6 md:flex-row md:items-end md:justify-between md:p-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d8c27a]">
              Participant Admin
            </p>
            <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
              Championship participant applications
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d9d4ca]">
              Review applicant profiles, category entries, supporting files, and
              current review status in one private workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/jury-applications"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#d8c27a] hover:text-[#d8c27a]"
            >
              Jury Dashboard
            </Link>
            <Link
              href="/admin/scoring"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#d8c27a] hover:text-[#d8c27a]"
            >
              Scoring Dashboard
            </Link>

            <form action={logoutAdminAction}>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#d8c27a] hover:text-[#d8c27a]"
              >
                Log Out
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {[
            { label: "Total", value: totals.total },
            { label: "Payment Pending", value: totals.paymentPending },
            { label: "Submitted", value: totals.submitted },
            { label: "Under Review", value: totals.underReview },
            { label: "Approved", value: totals.approved },
          ].map((item) => (
            <div
              key={item.label}
              className="page-card rounded-2xl bg-white/4.5 p-5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d8c27a]">
                {item.label}
              </p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <section className="page-card mt-6 rounded-3xl p-4 md:p-6">
          <div className="mb-5 flex flex-wrap gap-3">
            {[
              { label: "All", href: "/admin/applications", active: !activeStatus },
              {
                label: "Payment Pending",
                href: "/admin/applications?status=PAYMENT_PENDING",
                active: activeStatus === "PAYMENT_PENDING",
              },
              {
                label: "Submitted",
                href: "/admin/applications?status=SUBMITTED",
                active: activeStatus === "SUBMITTED",
              },
              {
                label: "Under Review",
                href: "/admin/applications?status=UNDER_REVIEW",
                active: activeStatus === "UNDER_REVIEW",
              },
              {
                label: "Approved",
                href: "/admin/applications?status=APPROVED",
                active: activeStatus === "APPROVED",
              },
              {
                label: "Rejected",
                href: "/admin/applications?status=REJECTED",
                active: activeStatus === "REJECTED",
              },
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

          <div className="hidden grid-cols-[1.1fr_0.9fr_1fr_0.8fr_0.8fr_0.9fr_0.7fr] gap-4 border-b border-white/10 px-4 pb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d9d4ca]/65 lg:grid">
            <span>Applicant</span>
            <span>Category</span>
            <span>Award</span>
            <span>App Status</span>
            <span>Payment</span>
            <span>Created</span>
            <span>Open</span>
          </div>

          <div className="divide-y divide-white/10">
            {applications.map((application) => (
              <div
                key={application.id}
                className="grid gap-4 px-4 py-5 transition hover:bg-white/2 lg:grid-cols-[1.1fr_0.9fr_1fr_0.8fr_0.8fr_0.9fr_0.7fr] lg:items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {application.fullName}
                  </p>
                  <p className="mt-1 text-sm text-[#d9d4ca]/80">
                    {application.email}
                  </p>
                  <p className="mt-1 text-sm text-[#d9d4ca]/80">
                    {application.city}, {application.country}
                  </p>
                </div>

                <div className="text-sm text-[#d9d4ca]">
                  {application.category.name}
                </div>

                <div className="text-sm text-[#d9d4ca]">
                  {application.award.name}
                </div>

                <div>
                  <ApplicationStatusBadge status={application.status} />
                </div>

                <div>
                  <PaymentStatusBadge status={application.paymentStatus} />
                </div>

                <div className="text-sm text-[#d9d4ca]/75">
                  {formatAdminDate(application.createdAt)}
                </div>

                <div>
                  <Link
                    href={`/admin/applications/${application.id}`}
                    className="inline-flex items-center justify-center rounded-full bg-[#d8c27a] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-[#e2d093]"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}

            {applications.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-[#d9d4ca]/75">
                No participant applications matched this filter.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </PageShell>
  );
}

import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { logoutAdminAction } from "@/app/admin/actions";
import { PageShell } from "@/components/layout/PageShell";

const statusStyles = {
  PAYMENT_PENDING: "bg-[#3c3214]/35 text-[#f1d98a] border-[#d8c27a]/30",
  SUBMITTED: "bg-white/8 text-white/85 border-white/12",
  UNDER_REVIEW: "bg-[#7a5a14]/25 text-[#f1d98a] border-[#d8c27a]/35",
  APPROVED: "bg-[#1b4d34]/45 text-[#9fe0b4] border-[#3e8f62]/45",
  REJECTED: "bg-[#5c2323]/45 text-[#f1aaaa] border-[#9d4a4a]/45",
} as const;

const paymentStatusStyles = {
  PENDING: "bg-white/8 text-white/85 border-white/12",
  PAID: "bg-[#1b4d34]/45 text-[#9fe0b4] border-[#3e8f62]/45",
  FAILED: "bg-[#5c2323]/45 text-[#f1aaaa] border-[#9d4a4a]/45",
  EXPIRED: "bg-[#523b19]/45 text-[#f3cb8a] border-[#9e7a43]/45",
  REFUNDED: "bg-[#2c3d5a]/45 text-[#bfd7ff] border-[#5577a8]/45",
} as const;

function formatDate(date: Date | null) {
  if (!date) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();

  const { status } = await searchParams;
  const activeStatus =
    status === "PAYMENT_PENDING" ||
    status === "SUBMITTED" ||
    status === "UNDER_REVIEW" ||
    status === "APPROVED" ||
    status === "REJECTED"
      ? status
      : undefined;

  const applications = await prisma.application.findMany({
    where: activeStatus
      ? {
          status: activeStatus,
        }
      : undefined,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: true,
      award: true,
    },
  });

  const allApplications = await prisma.application.findMany({
    select: {
      status: true,
    },
  });

  const totals = {
    total: allApplications.length,
    paymentPending: allApplications.filter((item) => item.status === "PAYMENT_PENDING")
      .length,
    submitted: allApplications.filter((item) => item.status === "SUBMITTED").length,
    underReview: allApplications.filter((item) => item.status === "UNDER_REVIEW").length,
    approved: allApplications.filter((item) => item.status === "APPROVED").length,
  };

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
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                      statusStyles[
                        application.status as keyof typeof statusStyles
                      ]
                    }`}
                  >
                    {application.status.replaceAll("_", " ")}
                  </span>
                </div>

                <div>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                      paymentStatusStyles[
                        application.paymentStatus as keyof typeof paymentStatusStyles
                      ]
                    }`}
                  >
                    {application.paymentStatus.replaceAll("_", " ")}
                  </span>
                </div>

                <div className="text-sm text-[#d9d4ca]/75">
                  {formatDate(application.createdAt)}
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

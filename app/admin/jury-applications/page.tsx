import type { JuryApplicationStatus, PaymentStatus } from "@prisma/client";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { logoutAdminAction } from "@/app/admin/actions";
import { PageShell } from "@/components/layout/PageShell";

const statusStyles: Record<JuryApplicationStatus, string> = {
  SUBMITTED: "bg-white/8 text-white/85 border-white/12",
  APPROVED: "bg-[#1b4d34]/45 text-[#9fe0b4] border-[#3e8f62]/45",
  REJECTED: "bg-[#5c2323]/45 text-[#f1aaaa] border-[#9d4a4a]/45",
  PAID: "bg-[#0f4d5d]/45 text-[#95dfea] border-[#4196aa]/45",
};

const paymentStatusStyles: Record<PaymentStatus, string> = {
  PENDING: "bg-[#7a5a14]/25 text-[#f1d98a] border-[#d8c27a]/35",
  PAID: "bg-[#1b4d34]/45 text-[#9fe0b4] border-[#3e8f62]/45",
  FAILED: "bg-[#5c2323]/45 text-[#f1aaaa] border-[#9d4a4a]/45",
};

function formatDate(date: Date | null) {
  if (!date) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function AdminJuryApplicationsPage() {
  await requireAdmin();

  const applications = await prisma.juryApplication.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      city: true,
      country: true,
      professionalTitle: true,
      expertiseAreas: true,
      status: true,
      paymentStatus: true,
      submittedAt: true,
      paidAt: true,
    },
  });

  const totalCount = applications.length;
  const pendingCount = applications.filter(
    (application) => application.status === "SUBMITTED"
  ).length;
  const approvedCount = applications.filter(
    (application) => application.status === "APPROVED"
  ).length;
  const activeJudgeCount = applications.filter(
    (application) => application.status === "PAID"
  ).length;

  return (
    <PageShell className="px-6 py-10 text-white md:px-10 md:py-12">
      <div className="mx-auto max-w-7xl pt-16">
        <div className="page-panel flex flex-col gap-5 rounded-3xl p-6 md:flex-row md:items-end md:justify-between md:p-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d8c27a]">
              Jury Admin
            </p>
            <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
              Jury applications dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d9d4ca]">
              Review submitted applications, send payment links after approval,
              and track final activation in one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/applications"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#d8c27a] hover:text-[#d8c27a]"
            >
              Participant Dashboard
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

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            { label: "Total", value: totalCount },
            { label: "Submitted", value: pendingCount },
            { label: "Approved", value: approvedCount },
            { label: "Paid Jurors", value: activeJudgeCount },
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
          <div className="hidden grid-cols-[1.15fr_0.95fr_0.95fr_0.75fr_0.75fr_0.8fr_0.65fr] gap-4 border-b border-white/10 px-4 pb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d9d4ca]/65 lg:grid">
            <span>Candidate</span>
            <span>Title</span>
            <span>Expertise</span>
            <span>Application</span>
            <span>Payment</span>
            <span>Date</span>
            <span>Open</span>
          </div>

          <div className="divide-y divide-white/10">
            {applications.map((application) => (
              <div
                key={application.id}
                className="grid gap-4 px-4 py-5 transition hover:bg-white/2 lg:grid-cols-[1.15fr_0.95fr_0.95fr_0.75fr_0.75fr_0.8fr_0.65fr] lg:items-center"
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
                  {application.professionalTitle}
                </div>

                <div className="flex flex-wrap gap-2">
                  {application.expertiseAreas.slice(0, 3).map((area) => (
                    <span
                      key={area}
                      className="rounded-full border border-white/12 bg-white/3 px-3 py-1 text-xs text-[#d9d4ca]"
                    >
                      {area}
                    </span>
                  ))}
                  {application.expertiseAreas.length > 3 ? (
                    <span className="rounded-full border border-white/12 bg-white/3 px-3 py-1 text-xs text-[#d9d4ca]/60">
                      +{application.expertiseAreas.length - 3}
                    </span>
                  ) : null}
                </div>

                <div>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                      statusStyles[application.status]
                    }`}
                  >
                    {application.status.replaceAll("_", " ")}
                  </span>
                </div>

                <div>
                  <span
                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                      paymentStatusStyles[application.paymentStatus]
                    }`}
                  >
                    {application.paymentStatus.replaceAll("_", " ")}
                  </span>
                </div>

                <div className="text-sm text-[#d9d4ca]/75">
                  {application.paidAt
                    ? formatDate(application.paidAt)
                    : formatDate(application.submittedAt)}
                </div>

                <div>
                  <Link
                    href={`/admin/jury-applications/${application.id}`}
                    className="inline-flex items-center justify-center rounded-full bg-[#d8c27a] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-black transition hover:bg-[#e2d093]"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}

            {applications.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-[#d9d4ca]/75">
                No jury applications have been submitted yet.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </PageShell>
  );
}

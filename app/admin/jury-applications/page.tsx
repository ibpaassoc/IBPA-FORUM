import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { logoutAdminAction } from "@/app/admin/actions";

const statusStyles: Record<string, string> = {
  SUBMITTED: "bg-white/8 text-white/85 border-white/12",
  UNDER_REVIEW: "bg-[#7a5a14]/25 text-[#f2cf72] border-[#d6a63a]/30",
  APPROVED: "bg-[#1b4d34]/45 text-[#9fe0b4] border-[#3e8f62]/45",
  REJECTED: "bg-[#5c2323]/45 text-[#f1aaaa] border-[#9d4a4a]/45",
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
      submittedAt: true,
      reviewedAt: true,
    },
  });

  const totalCount = applications.length;
  const submittedCount = applications.filter(
    (application) => application.status === "SUBMITTED"
  ).length;
  const reviewCount = applications.filter(
    (application) => application.status === "UNDER_REVIEW"
  ).length;
  const approvedCount = applications.filter(
    (application) => application.status === "APPROVED"
  ).length;

  return (
    <main className="min-h-screen bg-[#050505] px-6 py-12 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 rounded-[1.5rem] border border-white/12 bg-[linear-gradient(to_right,rgba(214,166,58,0.10),rgba(255,255,255,0.03))] p-6 md:flex-row md:items-end md:justify-between md:p-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d6a63a]">
              Jury Admin
            </p>
            <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
              Jury applications dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
              Review submitted applications, open candidate details, and track
              approval decisions in one place.
            </p>
          </div>

          <form action={logoutAdminAction}>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#d6a63a] hover:text-[#d6a63a]"
            >
              Log Out
            </button>
          </form>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {[
            { label: "Total", value: totalCount },
            { label: "Submitted", value: submittedCount },
            { label: "Under Review", value: reviewCount },
            { label: "Approved", value: approvedCount },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/12 bg-white/[0.03] p-5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d6a63a]">
                {item.label}
              </p>
              <p className="mt-3 text-3xl font-semibold">{item.value}</p>
            </div>
          ))}
        </div>

        <section className="mt-6 rounded-[1.5rem] border border-white/12 bg-white/[0.03] p-4 md:p-6">
          <div className="hidden grid-cols-[1.2fr_1fr_1fr_0.8fr_0.8fr_0.7fr] gap-4 border-b border-white/10 px-4 pb-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/40 lg:grid">
            <span>Candidate</span>
            <span>Title</span>
            <span>Expertise</span>
            <span>Status</span>
            <span>Submitted</span>
            <span>Open</span>
          </div>

          <div className="divide-y divide-white/10">
            {applications.map((application) => (
              <div
                key={application.id}
                className="grid gap-4 px-4 py-5 lg:grid-cols-[1.2fr_1fr_1fr_0.8fr_0.8fr_0.7fr] lg:items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-white">
                    {application.fullName}
                  </p>
                  <p className="mt-1 text-sm text-white/55">{application.email}</p>
                  <p className="mt-1 text-sm text-white/55">
                    {application.city}, {application.country}
                  </p>
                </div>

                <div className="text-sm text-white/75">
                  {application.professionalTitle}
                </div>

                <div className="flex flex-wrap gap-2">
                  {application.expertiseAreas.slice(0, 3).map((area) => (
                    <span
                      key={area}
                      className="rounded-full border border-white/12 px-3 py-1 text-xs text-white/70"
                    >
                      {area}
                    </span>
                  ))}
                  {application.expertiseAreas.length > 3 ? (
                    <span className="rounded-full border border-white/12 px-3 py-1 text-xs text-white/45">
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

                <div className="text-sm text-white/60">
                  {formatDate(application.submittedAt)}
                </div>

                <div>
                  <Link
                    href={`/admin/jury-applications/${application.id}`}
                    className="inline-flex items-center justify-center rounded-full bg-[#d6a63a] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-black transition hover:opacity-90"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}

            {applications.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-white/60">
                No jury applications have been submitted yet.
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

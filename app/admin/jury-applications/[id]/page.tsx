import type { JuryApplicationStatus, PaymentStatus } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  approveJuryApplicationAction,
  logoutAdminAction,
  rejectJuryApplicationAction,
  saveJuryApplicationNotesAction,
  updateJuryApplicationStatusAction,
} from "@/app/admin/actions";
import { PageShell } from "@/components/layout/PageShell";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

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

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/4.5 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d8c27a]">
        {label}
      </p>
      <p className="mt-3 text-sm leading-6 text-[#f1ecde]">{value}</p>
    </div>
  );
}

export default async function AdminJuryApplicationDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  await requireAdmin();

  const { id } = await params;
  const { error, notice } = await searchParams;

  if (!id) {
    notFound();
  }

  const application = await prisma.juryApplication.findUnique({
    where: { id },
    include: {
      files: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!application) {
    notFound();
  }

  const profilePhoto = application.files.find(
    (file) => file.fieldKey === "profilePhoto"
  );
  const certifications = application.files.filter(
    (file) => file.fieldKey === "certifications"
  );

  return (
    <PageShell className="px-6 py-10 text-white md:px-10 md:py-12">
      <div className="mx-auto max-w-7xl pt-16">
        <div className="page-panel flex flex-col gap-5 rounded-3xl p-6 md:flex-row md:items-end md:justify-between md:p-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d8c27a]">
              Jury Admin
            </p>
            <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
              {application.fullName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d9d4ca]">
              {application.professionalTitle} from {application.city},{" "}
              {application.country}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/jury-applications"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#d8c27a] hover:text-[#d8c27a]"
            >
              Back to List
            </Link>
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

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            {error ? (
              <div className="rounded-2xl border border-[#a64b4b]/55 bg-[#4d1d1d]/35 px-5 py-4 text-sm leading-7 text-white">
                {error}
              </div>
            ) : null}

            {notice ? (
              <div className="rounded-2xl border border-[#d8c27a]/35 bg-[#d8c27a]/10 px-5 py-4 text-sm leading-7 text-white">
                {notice}
              </div>
            ) : null}

            <section className="page-card rounded-3xl p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
                Applicant
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <DetailItem label="Full Name" value={application.fullName} />
                <DetailItem label="Email" value={application.email} />
                <DetailItem label="Phone" value={application.phone} />
                <DetailItem
                  label="Location"
                  value={`${application.city}, ${application.country}`}
                />
                <DetailItem
                  label="Professional Title"
                  value={application.professionalTitle}
                />
                <DetailItem
                  label="Employer / Affiliation"
                  value={application.employerAffiliation}
                />
                <DetailItem
                  label="Years of Experience"
                  value={String(application.yearsExperience)}
                />
                <DetailItem
                  label="Membership"
                  value={
                    application.membershipLevel
                      ? `${application.membershipStatus ?? "Not provided"} (${application.membershipLevel})`
                      : application.membershipStatus || "Not provided"
                  }
                />
              </div>
            </section>

            <section className="page-card rounded-3xl p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
                Experience
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <DetailItem
                  label="Previous Judging Experience"
                  value={
                    application.previousJudgingExperience
                      ? application.previousJudgingDetails || "Yes"
                      : "No"
                  }
                />
                <DetailItem
                  label="Past IBPA Winner"
                  value={
                    application.pastWinner
                      ? application.pastWinnerYear
                        ? `Yes, ${application.pastWinnerYear}`
                        : "Yes"
                      : "No"
                  }
                />
              </div>

              <div className="mt-4 rounded-2xl border border-white/12 bg-white/[0.035] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d8c27a]">
                  Areas of Expertise
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {application.expertiseAreas.map((area: string) => (
                    <span
                      key={area}
                      className="rounded-full border border-white/12 bg-white/3 px-3 py-1 text-xs text-[#d9d4ca]"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="page-card rounded-3xl p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
                Statements
              </p>

              <div className="mt-5 space-y-4">
                <DetailItem
                  label="Professional Bio"
                  value={application.professionalBio}
                />
                <DetailItem
                  label="Conflict Disclosure"
                  value={application.conflictDisclosure}
                />
                <DetailItem
                  label="Why They Want to Judge"
                  value={application.motivation}
                />
                <DetailItem
                  label="Website / LinkedIn"
                  value={application.professionalWebsite || "Not provided"}
                />
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="page-card rounded-3xl p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
                Review Panel
              </p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/12 bg-white/[0.035] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d8c27a]">
                    Application Status
                  </p>
                  <span
                    className={`mt-4 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                      statusStyles[application.status]
                    }`}
                  >
                    {application.status.replaceAll("_", " ")}
                  </span>
                </div>

                <div className="rounded-2xl border border-white/12 bg-white/[0.035] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d8c27a]">
                    Payment Status
                  </p>
                  <span
                    className={`mt-4 inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                      paymentStatusStyles[application.paymentStatus]
                    }`}
                  >
                    {application.paymentStatus.replaceAll("_", " ")}
                  </span>
                </div>
              </div>

              <form action={saveJuryApplicationNotesAction} className="mt-5 space-y-5">
                <input type="hidden" name="id" value={application.id} />

                <div>
                  <label
                    htmlFor="adminNotes"
                    className="mb-2 block text-sm font-medium text-white"
                  >
                    Admin notes
                  </label>
                  <textarea
                    id="adminNotes"
                    name="adminNotes"
                    defaultValue={application.adminNotes || ""}
                    className="min-h-45 w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#d9d4ca]/45 focus:border-[#d8c27a] focus:bg-white/7"
                    placeholder="Add internal review notes, follow-up items, or approval context."
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-[#d8c27a] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#e2d093]"
                >
                  Save Notes
                </button>
              </form>

              <form
                action={updateJuryApplicationStatusAction}
                className="mt-5 rounded-2xl border border-white/12 bg-white/[0.035] p-4"
              >
                <input type="hidden" name="id" value={application.id} />

                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d8c27a]">
                  Change Status
                </p>
                <p className="mt-3 text-sm leading-6 text-[#d9d4ca]">
                  Move this application back to submitted, approve it again with
                  a fresh payment link, or reject it after review. Paid status
                  remains webhook-only.
                </p>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <select
                    name="status"
                    defaultValue={application.status}
                    className="w-full rounded-full border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-[#d8c27a] focus:bg-white/7 sm:max-w-[240px]"
                  >
                    <option value="SUBMITTED" className="bg-[#101010] text-white">
                      Submitted
                    </option>
                    <option value="APPROVED" className="bg-[#101010] text-white">
                      Approved
                    </option>
                    <option value="REJECTED" className="bg-[#101010] text-white">
                      Rejected
                    </option>
                    <option value="PAID" className="bg-[#101010] text-white" disabled>
                      Paid (webhook only)
                    </option>
                  </select>

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#d8c27a] hover:text-[#d8c27a]"
                  >
                    Update Status
                  </button>
                </div>
              </form>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <DetailItem
                  label="Submitted"
                  value={formatDate(application.submittedAt)}
                />
                <DetailItem
                  label="Approved At"
                  value={formatDate(application.approvedAt)}
                />
                <DetailItem
                  label="Rejected At"
                  value={formatDate(application.rejectedAt)}
                />
                <DetailItem label="Paid At" value={formatDate(application.paidAt)} />
                <DetailItem
                  label="Stripe Session"
                  value={application.stripeCheckoutSessionId || "Not created"}
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {application.status !== "PAID" ? (
                  <form action={approveJuryApplicationAction}>
                    <input type="hidden" name="id" value={application.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-full bg-[#d8c27a] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#e2d093]"
                    >
                      Approve & Send Payment Link
                    </button>
                  </form>
                ) : null}

                {application.status !== "REJECTED" &&
                application.status !== "PAID" ? (
                  <form action={rejectJuryApplicationAction}>
                    <input type="hidden" name="id" value={application.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-full border border-[#a64b4b]/55 bg-[#4d1d1d]/35 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#d67a7a]"
                    >
                      Reject Application
                    </button>
                  </form>
                ) : null}
              </div>
            </section>

            <section className="page-card rounded-3xl p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
                Files
              </p>

              {profilePhoto ? (
                <div className="mt-5">
                  <p className="text-sm font-medium text-white">Profile Photo</p>
                  <div className="mt-4 overflow-hidden rounded-2xl border border-white/12 bg-white/3">
                    <Image
                      src={`/api/admin/jury-files/${profilePhoto.id}`}
                      alt={application.fullName}
                      width={960}
                      height={960}
                      unoptimized
                      className="h-auto w-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <p className="mt-5 text-sm text-[#d9d4ca]/75">
                  No profile photo was saved for this application.
                </p>
              )}

              <div className="mt-6">
                <p className="text-sm font-medium text-white">Certifications</p>

                <div className="mt-4 space-y-3">
                  {certifications.map((file) => (
                    <a
                      key={file.id}
                      href={`/api/admin/jury-files/${file.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-2xl border border-white/12 bg-white/[0.035] px-4 py-3 text-sm text-[#d9d4ca] transition hover:border-[#d8c27a] hover:text-white"
                    >
                      <span>{file.fileName}</span>
                      <span className="text-xs text-white/45">
                        {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </a>
                  ))}

                  {certifications.length === 0 ? (
                    <p className="text-sm text-[#d9d4ca]/75">
                      No certifications were saved for this application.
                    </p>
                  ) : null}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

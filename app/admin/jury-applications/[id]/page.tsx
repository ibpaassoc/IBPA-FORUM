import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import {
  logoutAdminAction,
  updateJuryApplicationReview,
} from "@/app/admin/actions";

const statusOptions = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
] as const;

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
    <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d6a63a]">
        {label}
      </p>
      <p className="mt-3 text-sm leading-6 text-white/85">{value}</p>
    </div>
  );
}

export default async function AdminJuryApplicationDetailsPage(
  props: PageProps<"/admin/jury-applications/[id]">
) {
  await requireAdmin();

  const { id } = await props.params;

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
    <main className="min-h-screen bg-[#050505] px-6 py-12 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 rounded-[1.5rem] border border-white/12 bg-[linear-gradient(to_right,rgba(214,166,58,0.10),rgba(255,255,255,0.03))] p-6 md:flex-row md:items-end md:justify-between md:p-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d6a63a]">
              Jury Admin
            </p>
            <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
              {application.fullName}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">
              {application.professionalTitle} from {application.city},{" "}
              {application.country}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/jury-applications"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#d6a63a] hover:text-[#d6a63a]"
            >
              Back to List
            </Link>
            <form action={logoutAdminAction}>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#d6a63a] hover:text-[#d6a63a]"
              >
                Log Out
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <section className="rounded-[1.5rem] border border-white/12 bg-white/[0.03] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d6a63a]">
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
                      ? `${application.membershipStatus} (${application.membershipLevel})`
                      : application.membershipStatus
                  }
                />
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-white/12 bg-white/[0.03] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d6a63a]">
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

              <div className="mt-4 rounded-2xl border border-white/12 bg-black/20 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d6a63a]">
                  Areas of Expertise
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {application.expertiseAreas.map((area) => (
                    <span
                      key={area}
                      className="rounded-full border border-white/12 px-3 py-1 text-xs text-white/75"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-white/12 bg-white/[0.03] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d6a63a]">
                Statements
              </p>
              <div className="mt-5 space-y-4">
                <DetailItem label="Professional Bio" value={application.professionalBio} />
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
            <section className="rounded-[1.5rem] border border-white/12 bg-white/[0.03] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d6a63a]">
                Review Panel
              </p>

              <form action={updateJuryApplicationReview} className="mt-5 space-y-5">
                <input type="hidden" name="id" value={application.id} />

                <div>
                  <label
                    htmlFor="status"
                    className="mb-2 block text-sm font-medium text-white"
                  >
                    Review status
                  </label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={application.status}
                    className="w-full rounded-2xl border border-white/12 bg-white/4 px-4 py-3 text-sm text-white outline-none transition focus:border-[#d6a63a] focus:bg-white/6"
                  >
                    {statusOptions.map((status) => (
                      <option
                        key={status}
                        value={status}
                        className="bg-[#101010] text-white"
                      >
                        {status.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>

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
                    className="min-h-[180px] w-full rounded-2xl border border-white/12 bg-white/4 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#d6a63a] focus:bg-white/6"
                    placeholder="Add internal review notes, follow-up items, or approval context."
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-[#d6a63a] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition hover:opacity-90"
                >
                  Save Review
                </button>
              </form>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <DetailItem
                  label="Submitted"
                  value={formatDate(application.submittedAt)}
                />
                <DetailItem
                  label="Last Reviewed"
                  value={formatDate(application.reviewedAt)}
                />
              </div>
            </section>

            <section className="rounded-[1.5rem] border border-white/12 bg-white/[0.03] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d6a63a]">
                Files
              </p>

              {profilePhoto ? (
                <div className="mt-5">
                  <p className="text-sm font-medium text-white">Profile Photo</p>
                  <div className="mt-4 overflow-hidden rounded-2xl border border-white/12 bg-black/20">
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
                <p className="mt-5 text-sm text-white/55">
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
                      className="flex items-center justify-between rounded-2xl border border-white/12 bg-black/20 px-4 py-3 text-sm text-white/80 transition hover:border-[#d6a63a] hover:text-white"
                    >
                      <span>{file.fileName}</span>
                      <span className="text-xs text-white/45">
                        {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </a>
                  ))}

                  {certifications.length === 0 ? (
                    <p className="text-sm text-white/55">
                      No certifications were saved for this application.
                    </p>
                  ) : null}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

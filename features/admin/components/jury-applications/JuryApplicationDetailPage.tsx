import Image from "next/image";
import type { JuryApplication, JuryApplicationFile } from "@prisma/client";
import ApplicationStatusBadge from "@/features/admin/components/badges/ApplicationStatusBadge";
import {
  approveJuryApplicationAction,
  rejectJuryApplicationAction,
  saveJuryApplicationNotesAction,
} from "@/features/admin/actions/jury.actions";
import DeleteJuryApplicationButton from "@/features/admin/components/jury-applications/DeleteJuryApplicationButton";
import { formatAdminDate } from "@/features/admin/server/view-models";
import {
  DashboardCard,
  DashboardDetailCard,
  DashboardSecondaryBtn,
  DashboardChip,
  dashboardTextareaClass,
} from "@/shared/components/admin/DashboardUI";

type JuryApplicationDetail = JuryApplication & {
  files: JuryApplicationFile[];
};

function FileLink({ href, name, sizeBytes }: { href: string; name: string; sizeBytes: number }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between rounded-[16px] border border-slate-200 bg-slate-50/60 px-4 py-3 text-sm text-[#10203B] transition hover:border-[#4C7D9D]/40 hover:bg-white"
    >
      <span>{name}</span>
      <span className="text-xs text-slate-400">{(sizeBytes / 1024 / 1024).toFixed(2)} MB</span>
    </a>
  );
}

export default function JuryApplicationDetailPage({
  application,
  error,
  notice,
}: {
  application: JuryApplicationDetail;
  error?: string;
  notice?: string;
}) {
  const profilePhoto = application.files.find((f) => f.fieldKey === "profilePhoto");
  const certifications = application.files.filter((f) => f.fieldKey === "certifications");

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">Jury Applicant</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#10203B]">{application.fullName}</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {application.professionalTitle} · {application.city}, {application.country}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DashboardSecondaryBtn href="/admin/jury-applications">← Back</DashboardSecondaryBtn>
          <DeleteJuryApplicationButton id={application.id} fullName={application.fullName} />
        </div>
      </div>

      {error && (
        <div className="rounded-[16px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-[16px] border border-[#4C7D9D]/30 bg-[#4C7D9D]/5 px-5 py-4 text-sm text-[#10203B]">
          {notice}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <DashboardCard>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">Applicant</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <DashboardDetailCard label="Full name" value={application.fullName} />
              <DashboardDetailCard label="Email" value={application.email} />
              <DashboardDetailCard label="Phone" value={application.phone} />
              <DashboardDetailCard label="Location" value={`${application.city}, ${application.country}`} />
              <DashboardDetailCard label="Professional title" value={application.professionalTitle} />
              <DashboardDetailCard label="Employer / Affiliation" value={application.employerAffiliation} />
              <DashboardDetailCard label="Years of experience" value={String(application.yearsExperience)} />
              <DashboardDetailCard
                label="Membership"
                value={
                  application.membershipLevel
                    ? `${application.membershipStatus ?? "Not provided"} (${application.membershipLevel})`
                    : application.membershipStatus || "Not provided"
                }
              />
              <DashboardDetailCard
                label="IBPA Association Member"
                value={application.ibpaAssociationMember ? "Yes" : "No"}
              />
              {application.ibpaAssociationMember && (
                <DashboardDetailCard label="IBPA Number" value={application.ibpaNumber || "Not provided"} />
              )}
            </div>
          </DashboardCard>

          <DashboardCard>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">Experience</p>
            <div className="mt-4">
              <DashboardDetailCard
                label="Previous judging experience"
                value={
                  application.previousJudgingExperience
                    ? application.previousJudgingDetails || "Yes"
                    : "No"
                }
              />
            </div>
            {application.expertiseAreas.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">
                  Expertise areas
                </p>
                <div className="flex flex-wrap gap-2">
                  {application.expertiseAreas.map((area: string) => (
                    <DashboardChip key={area}>{area}</DashboardChip>
                  ))}
                </div>
              </div>
            )}
          </DashboardCard>

          <DashboardCard>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">Statements</p>
            <div className="mt-4 space-y-3">
              <DashboardDetailCard label="Professional bio" value={application.professionalBio} />
              <DashboardDetailCard label="Conflict disclosure" value={application.conflictDisclosure} />
              <DashboardDetailCard label="Why they want to judge" value={application.motivation} />
              <DashboardDetailCard
                label="Website / LinkedIn"
                value={application.professionalWebsite || "Not provided"}
              />
            </div>
          </DashboardCard>
        </div>

        <div className="space-y-5">
          <DashboardCard>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">Review Panel</p>
            <div className="mt-4">
              <ApplicationStatusBadge status={application.status} />
            </div>

            <form action={saveJuryApplicationNotesAction} className="mt-5 space-y-4">
              <input type="hidden" name="id" value={application.id} />
              <div>
                <label htmlFor="adminNotes" className="mb-2 block text-sm font-semibold text-[#10203B]">
                  Admin notes
                </label>
                <textarea
                  id="adminNotes"
                  name="adminNotes"
                  defaultValue={application.adminNotes || ""}
                  rows={5}
                  placeholder="Add internal review notes, follow-up items, or approval context."
                  className={dashboardTextareaClass}
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-2xl bg-[#10203B] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#1a3357]"
                >
                  Save Notes
                </button>
              </div>
            </form>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <DashboardDetailCard label="Submitted" value={formatAdminDate(application.submittedAt)} />
              <DashboardDetailCard label="Approved at" value={formatAdminDate(application.approvedAt)} />
              <DashboardDetailCard label="Paid at" value={formatAdminDate(application.paidAt)} />
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {application.status !== "PAID" && (
                <>
                  <form action={approveJuryApplicationAction}>
                    <input type="hidden" name="id" value={application.id} />
                    <input type="hidden" name="isIbpaMember" value="true" />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-2xl bg-[#10203B] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#1a3357]"
                    >
                      Approve (IBPA Member)
                    </button>
                  </form>
                  <form action={approveJuryApplicationAction}>
                    <input type="hidden" name="id" value={application.id} />
                    <input type="hidden" name="isIbpaMember" value="false" />
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-2xl bg-[#10203B] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#1a3357]"
                    >
                      Approve (Non-Member)
                    </button>
                  </form>
                </>
              )}
              {application.status !== "REJECTED" && application.status !== "PAID" && (
                <form action={rejectJuryApplicationAction}>
                  <input type="hidden" name="id" value={application.id} />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-white px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-600 transition hover:border-red-300 hover:bg-red-50"
                  >
                    Reject Application
                  </button>
                </form>
              )}
            </div>
          </DashboardCard>

          <DashboardCard>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">Files</p>
            <div className="mt-4">
              {profilePhoto ? (
                <div>
                  <p className="mb-2 text-sm font-semibold text-[#10203B]">Profile Photo</p>
                  <div className="overflow-hidden rounded-[16px] border border-slate-200">
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
                <p className="text-sm text-slate-400">No profile photo uploaded.</p>
              )}
            </div>
            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold text-[#10203B]">Certifications</p>
              <div className="space-y-2">
                {certifications.map((file) => (
                  <FileLink
                    key={file.id}
                    href={`/api/admin/jury-files/${file.id}`}
                    name={file.fileName}
                    sizeBytes={file.fileSize}
                  />
                ))}
                {certifications.length === 0 && (
                  <p className="text-sm text-slate-400">No certifications uploaded.</p>
                )}
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}

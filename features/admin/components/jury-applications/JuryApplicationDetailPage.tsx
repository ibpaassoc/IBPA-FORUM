import Image from "next/image";
import type { JuryApplication, JuryApplicationFile } from "@prisma/client";
import ApplicationStatusBadge from "@/features/admin/components/badges/ApplicationStatusBadge";
import PaymentStatusBadge from "@/features/admin/components/badges/PaymentStatusBadge";
import { logoutAdminAction } from "@/features/admin/actions/auth.actions";
import {
  approveJuryApplicationAction,
  rejectJuryApplicationAction,
  saveJuryApplicationNotesAction,
  updateJuryApplicationStatusAction,
} from "@/features/admin/actions/jury.actions";
import { formatAdminDate } from "@/features/admin/server/view-models";
import {
  AdminDashboardShell,
  AdminDetailCard,
  AdminHeroCard,
  AdminToolbarButton,
} from "@/shared/components/admin/AdminDashboard";

type JuryApplicationDetail = JuryApplication & {
  files: JuryApplicationFile[];
};

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return <AdminDetailCard label={label} value={value} />;
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
  const profilePhoto = application.files.find(
    (file) => file.fieldKey === "profilePhoto"
  );
  const certifications = application.files.filter(
    (file) => file.fieldKey === "certifications"
  );

  return (
    <AdminDashboardShell>
      <AdminHeroCard
        eyebrow="Jury Admin"
        title={application.fullName}
        subtitle={`${application.professionalTitle} from ${application.city}, ${application.country}`}
        actions={
          <>
            <AdminToolbarButton href="/admin/jury-applications">Back to List</AdminToolbarButton>
          </>
        }
      />

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            {error ? (
              <div className="admin-alert-danger rounded-2xl px-5 py-4 text-sm leading-7">
                {error}
              </div>
            ) : null}

            {notice ? (
              <div className="rounded-2xl border admin-alert-note px-5 py-4 text-sm leading-7">
                {notice}
              </div>
            ) : null}

            <section className="admin-card rounded-3xl p-6">
              <p className="admin-eyebrow">
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

            <section className="admin-card rounded-3xl p-6">
              <p className="admin-eyebrow">
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

              <div className="admin-detail-card mt-4 rounded-2xl p-4">
                <p className="admin-eyebrow">
                  Areas of Expertise
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {application.expertiseAreas.map((area: string) => (
                    <span
                      key={area}
                      className="admin-chip rounded-full px-3 py-1 text-xs"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            <section className="admin-card rounded-3xl p-6">
              <p className="admin-eyebrow">
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
            <section className="admin-card rounded-3xl p-6">
              <p className="admin-eyebrow">
                Review Panel
              </p>

              <div className="mt-5 grid gap-4">
                <div className="admin-detail-card rounded-2xl p-4">
                  <p className="admin-eyebrow">
                    Application Status
                  </p>
                  <div className="mt-4">
                    <ApplicationStatusBadge status={application.status} />
                  </div>
                </div>
              </div>

              <form action={saveJuryApplicationNotesAction} className="mt-5 space-y-5">
                <input type="hidden" name="id" value={application.id} />

                <div>
                  <label
                    htmlFor="adminNotes"
                    className="admin-label mb-2 block text-sm font-semibold"
                  >
                    Admin notes
                  </label>
                  <textarea
                    id="adminNotes"
                    name="adminNotes"
                    defaultValue={application.adminNotes || ""}
                    className="admin-field min-h-45 w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
                    placeholder="Add internal review notes, follow-up items, or approval context."
                  />
                </div>
                
                <div className="justify-self-center">
                    <button
                        type="submit"
                        className="admin-action-primary inline-flex items-center rounded-full px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition"
                        >
                        Save Notes
                    </button>
                </div>
              </form>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <DetailItem
                  label="Submitted"
                  value={formatAdminDate(application.submittedAt)}
                />
                <DetailItem
                  label="Approved At"
                  value={formatAdminDate(application.approvedAt)}
                />
                <DetailItem label="Paid At" value={formatAdminDate(application.paidAt)} />
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                {application.status !== "PAID" ? (
                  <form action={approveJuryApplicationAction}>
                    <input type="hidden" name="id" value={application.id} />
                    <button
                      type="submit"
                      className="admin-action-primary inline-flex items-center justify-center rounded-full px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition"
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
                      className="admin-alert-danger inline-flex items-center justify-center rounded-full px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition hover:border-(--admin-gold) hover:text-(--admin-gold-strong)"
                    >
                      Reject Application
                    </button>
                  </form>
                ) : null}
              </div>
            </section>

            <section className="admin-card rounded-3xl p-6">
              <p className="admin-eyebrow">
                Files
              </p>

              {profilePhoto ? (
                <div className="mt-5">
                  <p className="text-sm font-semibold text-(--admin-ink)">Profile Photo</p>
                  <div className="mt-4 overflow-hidden rounded-2xl border border-[rgba(26,38,64,0.12)] bg-white">
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
                <p className="admin-empty mt-5 text-sm">
                  No profile photo was saved for this application.
                </p>
              )}

              <div className="mt-6">
                <p className="text-sm font-semibold text-(--admin-ink)">Certifications</p>

                <div className="mt-4 space-y-3">
                  {certifications.map((file) => (
                    <a
                      key={file.id}
                      href={`/api/admin/jury-files/${file.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-detail-card flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition hover:border-(--admin-gold)"
                    >
                      <span>{file.fileName}</span>
                      <span className="admin-muted text-xs">
                        {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </a>
                  ))}

                  {certifications.length === 0 ? (
                    <p className="admin-muted text-sm">
                      No certifications were saved for this application.
                    </p>
                  ) : null}
                </div>
              </div>
            </section>
          </div>
        </div>
    </AdminDashboardShell>
  );
}

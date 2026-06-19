import Image from "next/image";
import type { JuryApplication, JuryApplicationFile } from "@prisma/client";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  ExternalLink,
  Files,
  Globe,
  Mail,
  MapPin,
  Phone,
  UserRound,
  XCircle,
} from "lucide-react";
import ApplicationStatusBadge from "@/features/admin/components/badges/ApplicationStatusBadge";
import PaymentStatusBadge from "@/features/admin/components/badges/PaymentStatusBadge";
import {
  approveJuryApplicationAction,
  rejectJuryApplicationAction,
  saveJuryApplicationNotesAction,
} from "@/features/admin/actions/jury.actions";
import DeleteJuryApplicationButton from "@/features/admin/components/jury-applications/DeleteJuryApplicationButton";
import RequestAdditionalInfoPanel from "@/features/admin/components/jury-applications/RequestAdditionalInfoPanel";
import { formatAdminDate } from "@/features/admin/server/view-models";
import {
  DashboardAccentBlock,
  DashboardCard,
  DashboardChip,
  DashboardDetailCard,
  DashboardPageHeader,
  DashboardPanel,
  DashboardPrimaryBtn,
  DashboardSecondaryBtn,
  dashboardTextareaClass,
} from "@/shared/components/admin/DashboardUI";

type JuryApplicationDetail = JuryApplication & {
  files: JuryApplicationFile[];
  infoRequestDetails?: string | null;
  infoRequestedAt?: Date | null;
  infoResubmittedAt?: Date | null;
};

function FileLink({ href, name, sizeBytes }: { href: string; name: string; sizeBytes: number }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center justify-between gap-3 rounded-lg border border-black/10 bg-white px-3 py-3 text-sm text-[#0A0A0A] transition hover:border-[#7DC8EE] hover:bg-[#EAF6FF]/45"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-[#EAF6FF] text-[#1673A5]">
          <Files aria-hidden size={15} />
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-[#0A0A0A]">{name}</p>
          <p className="text-xs text-black/45">{(sizeBytes / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      </div>
      <ExternalLink
        aria-hidden
        size={15}
        className="shrink-0 text-black/35 transition group-hover:text-[#1673A5]"
      />
    </a>
  );
}

function AlertMessage({ tone, children }: { tone: "error" | "notice"; children: string }) {
  const className =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-[#7DC8EE] bg-[#EAF6FF] text-[#0A0A0A]";

  return <div className={`rounded-lg border px-4 py-3 text-sm ${className}`}>{children}</div>;
}

function SectionTitle({
  icon: Icon,
  label,
  title,
}: {
  icon: typeof UserRound;
  label: string;
  title: string;
}) {
  return (
    <div className="border-b border-black/10 p-4 md:p-5">
      <div className="flex items-center gap-2 text-[#1673A5]">
        <Icon aria-hidden size={16} />
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">{label}</p>
      </div>
      <h2 className="mt-2 text-2xl font-semibold normal-case tracking-[-0.02em] text-[#0A0A0A]">
        {title}
      </h2>
    </div>
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
  const profilePhoto = application.files.find((file) => file.fieldKey === "profilePhoto");
  const certifications = application.files.filter((file) => file.fieldKey === "certifications");
  const canDecide = application.status !== "PAID";
  const canReject = application.status !== "REJECTED" && application.status !== "PAID";

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        label="Jury application"
        title={application.fullName}
        description={`${application.professionalTitle} in ${application.city}, ${application.country}`}
        actions={
          <>
            <DashboardSecondaryBtn href="/admin/jury-applications">
              <ArrowLeft aria-hidden size={15} />
              Back
            </DashboardSecondaryBtn>
            <DeleteJuryApplicationButton id={application.id} fullName={application.fullName} />
          </>
        }
      />

      {error ? <AlertMessage tone="error">{error}</AlertMessage> : null}
      {notice ? <AlertMessage tone="notice">{notice}</AlertMessage> : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-5">
          <DashboardCard className="p-0">
            <SectionTitle icon={UserRound} label="Applicant" title="Profile" />
            <div className="grid gap-3 p-4 md:grid-cols-2 md:p-5">
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
              {application.ibpaAssociationMember ? (
                <DashboardDetailCard label="IBPA Number" value={application.ibpaNumber || "Not provided"} />
              ) : null}
            </div>
          </DashboardCard>

          <DashboardCard className="p-0">
            <SectionTitle icon={BriefcaseBusiness} label="Experience" title="Expertise and judging history" />
            <div className="flex flex-col gap-4 p-4 md:p-5">
              <DashboardDetailCard
                label="Previous judging experience"
                value={
                  application.previousJudgingExperience
                    ? application.previousJudgingDetails || "Yes"
                    : "No"
                }
              />
              {application.expertiseAreas.length > 0 ? (
                <DashboardPanel>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/45">
                    Expertise areas
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {application.expertiseAreas.map((area: string) => (
                      <DashboardChip key={area}>{area}</DashboardChip>
                    ))}
                  </div>
                </DashboardPanel>
              ) : null}
            </div>
          </DashboardCard>

          <DashboardCard className="p-0">
            <SectionTitle icon={Globe} label="Statements" title="Bio and disclosures" />
            <div className="grid gap-3 p-4 md:p-5">
              <DashboardDetailCard label="Professional bio" value={application.professionalBio} />
              <DashboardDetailCard label="Conflict disclosure" value={application.conflictDisclosure} />
              <DashboardDetailCard label="Why they want to judge" value={application.motivation} />
              <DashboardDetailCard
                label="Website / LinkedIn"
                value={application.professionalWebsite || "Not provided"}
              />
            </div>
          </DashboardCard>

          <DashboardCard className="p-0">
            <SectionTitle icon={Files} label="Files" title="Photo and certifications" />
            <div className="grid gap-4 p-4 md:p-5 lg:grid-cols-[minmax(220px,0.65fr)_minmax(0,1fr)]">
              <div>
                <p className="text-sm font-semibold text-[#0A0A0A]">Profile photo</p>
                <div className="mt-3 overflow-hidden rounded-lg border border-black/10 bg-[#FAFAFA]">
                  {profilePhoto ? (
                    <Image
                      src={`/api/admin/jury-files/${profilePhoto.id}`}
                      alt={application.fullName}
                      width={960}
                      height={960}
                      unoptimized
                      className="aspect-square w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-square items-center justify-center text-sm text-black/45">
                      No profile photo
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-[#0A0A0A]">Certifications</p>
                <div className="mt-3 flex flex-col gap-2">
                  {certifications.map((file) => (
                    <FileLink
                      key={file.id}
                      href={`/api/admin/jury-files/${file.id}`}
                      name={file.fileName}
                      sizeBytes={file.fileSize}
                    />
                  ))}
                  {certifications.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-black/15 bg-[#FAFAFA] px-4 py-4 text-sm text-black/50">
                      No certifications uploaded.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </DashboardCard>
        </div>

        <aside className="flex flex-col gap-4 xl:sticky xl:top-5 xl:self-start">
          <DashboardAccentBlock>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
              Review status
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <ApplicationStatusBadge status={application.status} />
              <PaymentStatusBadge status={application.paymentStatus} />
            </div>
            <div className="mt-4 grid gap-2 text-sm text-[var(--color-ink-soft)]">
              <span className="inline-flex items-center gap-2">
                <Mail aria-hidden size={14} />
                {application.email}
              </span>
              <span className="inline-flex items-center gap-2">
                <Phone aria-hidden size={14} />
                {application.phone}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin aria-hidden size={14} />
                {application.city}, {application.country}
              </span>
            </div>
          </DashboardAccentBlock>

          <DashboardCard>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1673A5]">
              Decision
            </p>
            <form action={saveJuryApplicationNotesAction} className="mt-4 flex flex-col gap-3">
              <input type="hidden" name="id" value={application.id} />
              <label htmlFor="adminNotes" className="text-sm font-semibold text-[#0A0A0A]">
                Admin notes
              </label>
              <textarea
                id="adminNotes"
                name="adminNotes"
                defaultValue={application.adminNotes || ""}
                rows={5}
                placeholder="Internal review notes"
                className={dashboardTextareaClass}
              />
              <DashboardSecondaryBtn type="submit" className="w-full">
                Save notes
              </DashboardSecondaryBtn>
            </form>

            <div className="mt-4 grid gap-2">
              {canDecide ? (
                <>
                  <form action={approveJuryApplicationAction}>
                    <input type="hidden" name="id" value={application.id} />
                    <input type="hidden" name="isIbpaMember" value="true" />
                    <DashboardPrimaryBtn type="submit" className="w-full">
                      <CheckCircle2 aria-hidden size={15} />
                      Approve IBPA member
                    </DashboardPrimaryBtn>
                  </form>
                  <form action={approveJuryApplicationAction}>
                    <input type="hidden" name="id" value={application.id} />
                    <input type="hidden" name="isIbpaMember" value="false" />
                    <DashboardPrimaryBtn type="submit" className="w-full">
                      <CheckCircle2 aria-hidden size={15} />
                      Approve non-member
                    </DashboardPrimaryBtn>
                  </form>
                </>
              ) : null}
              {canReject ? (
                <form action={rejectJuryApplicationAction}>
                  <input type="hidden" name="id" value={application.id} />
                  <button
                    type="submit"
                    className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-3.5 py-2 text-sm font-semibold leading-none text-red-700 transition hover:bg-red-50"
                  >
                    <XCircle aria-hidden size={15} />
                    Reject application
                  </button>
                </form>
              ) : null}
            </div>

            <RequestAdditionalInfoPanel
              applicationId={application.id}
              status={application.status}
              infoRequestDetails={application.infoRequestDetails}
              infoRequestedAt={application.infoRequestedAt}
              infoResubmittedAt={application.infoResubmittedAt}
            />
          </DashboardCard>

          <DashboardCard>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1673A5]">
              Timeline
            </p>
            <div className="mt-3 grid gap-3">
              <DashboardDetailCard label="Submitted" value={formatAdminDate(application.submittedAt)} />
              {application.infoRequestedAt ? (
                <DashboardDetailCard label="Info requested" value={formatAdminDate(application.infoRequestedAt)} />
              ) : null}
              {application.infoResubmittedAt ? (
                <DashboardDetailCard label="Applicant resubmitted" value={formatAdminDate(application.infoResubmittedAt)} />
              ) : null}
              <DashboardDetailCard label="Approved at" value={formatAdminDate(application.approvedAt)} />
              <DashboardDetailCard label="Paid at" value={formatAdminDate(application.paidAt)} />
            </div>
          </DashboardCard>
        </aside>
      </div>
    </div>
  );
}

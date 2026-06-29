import Image from "next/image";
import type { JuryApplication, JuryApplicationFile } from "@prisma/client";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  FileText,
  Files,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  StickyNote,
  UserRound,
  XCircle,
} from "lucide-react";
import ApplicationStatusBadge from "@/features/admin/components/badges/ApplicationStatusBadge";
import PaymentStatusBadge from "@/features/admin/components/badges/PaymentStatusBadge";
import {
  approveJuryApplicationAction,
  approveJuryApplicationWithoutPaymentAction,
  overrideJuryApplicationStatusAction,
  rejectJuryApplicationAction,
  saveJuryApplicationNotesAction,
} from "@/features/admin/actions/jury.actions";
import DeleteJuryApplicationButton from "@/features/admin/components/jury-applications/DeleteJuryApplicationButton";
import RequestAdditionalInfoPanel from "@/features/admin/components/jury-applications/RequestAdditionalInfoPanel";
import ReviewWorkspace, { type ReviewTab } from "@/features/admin/components/review/ReviewWorkspace";
import {
  MobileActionBar,
  ReviewActionPanel,
  ReviewSummaryCard,
} from "@/features/admin/components/review/ReviewPrimitives";
import { formatAdminDate } from "@/features/admin/server/view-models";
import {
  DashboardCard,
  DashboardChip,
  DashboardDetailCard,
  DashboardPanel,
  DashboardPrimaryBtn,
  DashboardSecondaryBtn,
  dashboardSelectClass,
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
      className="group flex items-center justify-between gap-3 rounded-[22px] border border-[rgba(37,42,45,0.08)] bg-white px-3 py-3 text-sm text-[var(--color-ink)] transition hover:border-[rgba(114,160,193,0.34)] hover:bg-[var(--color-blue-wash)]/60"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-[18px] bg-[var(--color-blue-wash)] text-[var(--color-blue)]">
          <Files aria-hidden size={15} />
        </div>
        <div className="min-w-0">
          <p className="truncate font-semibold text-[var(--color-ink)]">{name}</p>
          <p className="text-xs text-[var(--color-ink-muted)]">{(sizeBytes / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      </div>
      <ExternalLink
        aria-hidden
        size={15}
        className="shrink-0 text-[var(--color-ink-muted)] transition group-hover:text-[var(--color-blue)]"
      />
    </a>
  );
}

function AlertMessage({ tone, children }: { tone: "error" | "notice"; children: string }) {
  const className =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-[rgba(114,160,193,0.34)] bg-[var(--color-blue-wash)] text-[var(--color-ink)]";

  return <div className={`rounded-[22px] border px-4 py-3 text-sm ${className}`}>{children}</div>;
}

function EmptyInline({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[22px] border border-dashed border-[rgba(37,42,45,0.14)] bg-white/62 px-4 py-4 text-sm text-[var(--color-ink-soft)]">
      {children}
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

  // ── Tab content ─────────────────────────────────────────────────────────
  const overview = (
    <DashboardCard>
      <div className="grid gap-3 sm:grid-cols-2">
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
  );

  const submission = (
    <div className="flex flex-col gap-4">
      <DashboardCard className="flex flex-col gap-4">
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
              Expertise areas
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {application.expertiseAreas.map((area: string) => (
                <DashboardChip key={area}>{area}</DashboardChip>
              ))}
            </div>
          </DashboardPanel>
        ) : null}
      </DashboardCard>

      <DashboardCard className="grid gap-3">
        <DashboardDetailCard label="Professional bio" value={application.professionalBio} />
        <DashboardDetailCard label="Conflict disclosure" value={application.conflictDisclosure} />
        <DashboardDetailCard label="Why they want to judge" value={application.motivation} />
        <DashboardDetailCard
          label="Website / LinkedIn"
          value={application.professionalWebsite || "Not provided"}
        />
      </DashboardCard>
    </div>
  );

  const documents = (
    <div className="grid gap-4 lg:grid-cols-[minmax(220px,0.6fr)_minmax(0,1fr)]">
      <DashboardCard>
        <p className="text-sm font-medium text-[var(--color-ink)]">Profile photo</p>
        <div className="mt-3 overflow-hidden rounded-[22px] border border-[rgba(37,42,45,0.08)] bg-white/62">
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
            <div className="flex aspect-square items-center justify-center text-sm text-[var(--color-ink-muted)]">
              No profile photo
            </div>
          )}
        </div>
      </DashboardCard>

      <DashboardCard>
        <p className="text-sm font-medium text-[var(--color-ink)]">Certifications</p>
        <div className="mt-3 flex flex-col gap-2">
          {certifications.map((file) => (
            <FileLink
              key={file.id}
              href={`/api/admin/jury-files/${file.id}`}
              name={file.fileName}
              sizeBytes={file.fileSize}
            />
          ))}
          {certifications.length === 0 ? <EmptyInline>No certifications uploaded.</EmptyInline> : null}
        </div>
      </DashboardCard>
    </div>
  );

  const notes = (
    <div className="flex flex-col gap-4">
      <DashboardCard>
        <form action={saveJuryApplicationNotesAction} className="flex flex-col gap-3">
          <input type="hidden" name="id" value={application.id} />
          <label htmlFor="adminNotes" className="text-sm font-medium text-[var(--color-ink)]">
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
          <DashboardSecondaryBtn type="submit" className="w-full sm:w-auto">
            Save notes
          </DashboardSecondaryBtn>
        </form>
      </DashboardCard>

      <DashboardCard>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
          Timeline
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
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
    </div>
  );

  const tabs: ReviewTab[] = [
    { key: "overview", label: "Overview", icon: UserRound, content: overview },
    { key: "submission", label: "Submission", icon: BriefcaseBusiness, content: submission },
    { key: "documents", label: "Documents", icon: FileText, content: documents },
    { key: "notes", label: "Notes", icon: StickyNote, content: notes },
  ];

  // ── Sticky decision panel ────────────────────────────────────────────────
  const aside = (
    <div id="decision">
      <ReviewActionPanel title="Decision">
        <div className="flex flex-wrap gap-2">
          <ApplicationStatusBadge status={application.status} />
          <PaymentStatusBadge status={application.paymentStatus} />
        </div>

        {canDecide ? (
          <div className="mt-4 border-t border-[rgba(37,42,45,0.06)] pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
              Approve with payment
            </p>
            <div className="mt-2 grid gap-2">
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
            </div>

            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
              Approve without payment
            </p>
            <form action={approveJuryApplicationWithoutPaymentAction} className="mt-2">
              <input type="hidden" name="id" value={application.id} />
              <button
                type="submit"
                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[18px] border border-[rgba(114,160,193,0.28)] bg-[var(--color-blue-wash)] px-3.5 py-2 text-sm font-semibold leading-none text-[var(--color-blue)] transition hover:border-[rgba(114,160,193,0.42)] hover:bg-white"
              >
                <ShieldCheck aria-hidden size={15} />
                Activate without payment
              </button>
            </form>
            <p className="mt-1.5 text-xs leading-5 text-[var(--color-ink-muted)]">
              Marks the judge as active (PAID) immediately - no Stripe session or email is sent.
            </p>
          </div>
        ) : null}

        {canReject ? (
          <div className="mt-4 border-t border-[rgba(37,42,45,0.06)] pt-4">
            <form action={rejectJuryApplicationAction}>
              <input type="hidden" name="id" value={application.id} />
              <button
                type="submit"
                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[18px] border border-red-200 bg-white px-3.5 py-2 text-sm font-semibold leading-none text-red-700 transition hover:bg-red-50"
              >
                <XCircle aria-hidden size={15} />
                Reject application
              </button>
            </form>
          </div>
        ) : null}

        <RequestAdditionalInfoPanel
          applicationId={application.id}
          status={application.status}
          infoRequestDetails={application.infoRequestDetails}
          infoRequestedAt={application.infoRequestedAt}
          infoResubmittedAt={application.infoResubmittedAt}
        />

        <div className="mt-4 border-t border-[rgba(37,42,45,0.06)] pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
            Status override
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--color-ink-muted)]">
            Force a status without triggering emails or Stripe sessions.
          </p>
          <form action={overrideJuryApplicationStatusAction} className="mt-2 flex flex-col gap-2">
            <input type="hidden" name="id" value={application.id} />
            <select name="status" defaultValue={application.status} className={dashboardSelectClass}>
              <option value="SUBMITTED">Submitted</option>
              <option value="ADDITIONAL_INFO_REQUIRED">Additional info required</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="PAID">Paid / Active</option>
            </select>
            <DashboardSecondaryBtn type="submit" className="w-full">
              Set status
            </DashboardSecondaryBtn>
          </form>
        </div>
      </ReviewActionPanel>
    </div>
  );

  const mobileBar = (
    <MobileActionBar>
      <a
        href="#decision"
        className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[18px] border border-[var(--color-blue)] bg-[var(--color-blue)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#4d86ad]"
      >
        <CheckCircle2 aria-hidden size={15} />
        Decision
      </a>
      {canReject ? (
        <form action={rejectJuryApplicationAction} className="flex-1">
          <input type="hidden" name="id" value={application.id} />
          <button
            type="submit"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[18px] border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
          >
            <XCircle aria-hidden size={15} />
            Reject
          </button>
        </form>
      ) : null}
    </MobileActionBar>
  );

  const summary = (
    <ReviewSummaryCard
      name={application.fullName}
      subtitle={application.professionalTitle}
      avatarSrc={profilePhoto ? `/api/admin/jury-files/${profilePhoto.id}` : null}
      badges={
        <>
          <ApplicationStatusBadge status={application.status} />
          <PaymentStatusBadge status={application.paymentStatus} />
        </>
      }
      meta={[
        { icon: Mail, label: application.email },
        { icon: Phone, label: application.phone },
        { icon: MapPin, label: `${application.city}, ${application.country}` },
        { icon: CalendarClock, label: formatAdminDate(application.submittedAt) },
      ]}
      actions={
        <>
          <DashboardSecondaryBtn href="/admin/jury-applications">
            <ArrowLeft aria-hidden size={15} />
            Back
          </DashboardSecondaryBtn>
          <DashboardSecondaryBtn href={`/admin/jury-applications/${application.id}/edit`}>
            <Pencil aria-hidden size={15} />
            Edit
          </DashboardSecondaryBtn>
          <DeleteJuryApplicationButton id={application.id} fullName={application.fullName} />
        </>
      }
    />
  );

  return (
    <ReviewWorkspace
      summary={summary}
      alerts={
        error || notice ? (
          <div className="flex flex-col gap-2">
            {error ? <AlertMessage tone="error">{error}</AlertMessage> : null}
            {notice ? <AlertMessage tone="notice">{notice}</AlertMessage> : null}
          </div>
        ) : null
      }
      tabs={tabs}
      aside={aside}
      mobileBar={mobileBar}
    />
  );
}

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
import { adminT, formatAdminDate } from "@/lib/i18n/admin";
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
        <DashboardDetailCard label={adminT.detail.fullName} value={application.fullName} />
        <DashboardDetailCard label={adminT.detail.email} value={application.email} />
        <DashboardDetailCard label={adminT.detail.phone} value={application.phone} />
        <DashboardDetailCard label={adminT.detail.location} value={`${application.city}, ${application.country}`} />
        <DashboardDetailCard label={adminT.detail.professionalTitle} value={application.professionalTitle} />
        <DashboardDetailCard label={adminT.detail.employer} value={application.employerAffiliation} />
        <DashboardDetailCard label={adminT.detail.yearsExperience} value={String(application.yearsExperience)} />
        <DashboardDetailCard
          label={adminT.detail.membership}
          value={
            application.membershipLevel
              ? `${application.membershipStatus ?? adminT.common.notProvided} (${application.membershipLevel})`
              : application.membershipStatus || adminT.common.notProvided
          }
        />
        <DashboardDetailCard
          label={adminT.detail.ibpaMember}
          value={application.ibpaAssociationMember ? adminT.common.yes : adminT.common.no}
        />
        {application.ibpaAssociationMember ? (
          <DashboardDetailCard label={adminT.detail.ibpaNumber} value={application.ibpaNumber || adminT.common.notProvided} />
        ) : null}
      </div>
    </DashboardCard>
  );

  const submission = (
    <div className="flex flex-col gap-4">
      <DashboardCard className="flex flex-col gap-4">
        <DashboardDetailCard
          label={adminT.detail.previousJudging}
          value={
            application.previousJudgingExperience
              ? application.previousJudgingDetails || adminT.common.yes
              : adminT.common.no
          }
        />
        {application.expertiseAreas.length > 0 ? (
          <DashboardPanel>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
              {adminT.detail.expertiseAreas}
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
        <DashboardDetailCard label={adminT.detail.professionalBio} value={application.professionalBio} />
        <DashboardDetailCard label={adminT.detail.conflictDisclosure} value={application.conflictDisclosure} />
        <DashboardDetailCard label={adminT.detail.motivation} value={application.motivation} />
        <DashboardDetailCard
          label={adminT.detail.websiteLinkedin}
          value={application.professionalWebsite || adminT.common.notProvided}
        />
      </DashboardCard>
    </div>
  );

  const documents = (
    <div className="grid gap-4 lg:grid-cols-[minmax(220px,0.6fr)_minmax(0,1fr)]">
      <DashboardCard>
        <p className="text-sm font-medium text-[var(--color-ink)]">{adminT.detail.profilePhoto}</p>
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
              {adminT.detail.noProfilePhoto}
            </div>
          )}
        </div>
      </DashboardCard>

      <DashboardCard>
        <p className="text-sm font-medium text-[var(--color-ink)]">{adminT.detail.certifications}</p>
        <div className="mt-3 flex flex-col gap-2">
          {certifications.map((file) => (
            <FileLink
              key={file.id}
              href={`/api/admin/jury-files/${file.id}`}
              name={file.fileName}
              sizeBytes={file.fileSize}
            />
          ))}
          {certifications.length === 0 ? <EmptyInline>{adminT.detail.noCertifications}</EmptyInline> : null}
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
            {adminT.detail.adminNotes}
          </label>
          <textarea
            id="adminNotes"
            name="adminNotes"
            defaultValue={application.adminNotes || ""}
            rows={5}
            placeholder={adminT.detail.adminNotesPlaceholder}
            className={dashboardTextareaClass}
          />
          <DashboardSecondaryBtn type="submit" className="w-full sm:w-auto">
            {adminT.detail.saveNotes}
          </DashboardSecondaryBtn>
        </form>
      </DashboardCard>

      <DashboardCard>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
          {adminT.detail.timeline}
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <DashboardDetailCard label={adminT.detail.submittedAt} value={formatAdminDate(application.submittedAt)} />
          {application.infoRequestedAt ? (
            <DashboardDetailCard label={adminT.detail.infoRequestedAt} value={formatAdminDate(application.infoRequestedAt)} />
          ) : null}
          {application.infoResubmittedAt ? (
            <DashboardDetailCard label={adminT.detail.resubmittedAt} value={formatAdminDate(application.infoResubmittedAt)} />
          ) : null}
          <DashboardDetailCard label={adminT.detail.approvedAt} value={formatAdminDate(application.approvedAt)} />
          <DashboardDetailCard label={adminT.detail.paidAt} value={formatAdminDate(application.paidAt)} />
        </div>
      </DashboardCard>
    </div>
  );

  const tabs: ReviewTab[] = [
    { key: "overview", label: adminT.detail.tabs.overview, icon: <UserRound aria-hidden size={15} />, content: overview },
    { key: "submission", label: adminT.detail.tabs.submission, icon: <BriefcaseBusiness aria-hidden size={15} />, content: submission },
    { key: "documents", label: adminT.detail.tabs.documents, icon: <FileText aria-hidden size={15} />, content: documents },
    { key: "notes", label: adminT.detail.tabs.notes, icon: <StickyNote aria-hidden size={15} />, content: notes },
  ];

  // ── Sticky decision panel ────────────────────────────────────────────────
  const aside = (
    <div id="decision">
      <ReviewActionPanel title={adminT.detail.decision}>
        <div className="flex flex-wrap gap-2">
          <ApplicationStatusBadge status={application.status} />
          <PaymentStatusBadge status={application.paymentStatus} />
        </div>

        {canDecide ? (
          <div className="mt-4 border-t border-[rgba(37,42,45,0.06)] pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
              {adminT.detail.approveWithPayment}
            </p>
            <div className="mt-2 grid gap-2">
              <form action={approveJuryApplicationAction}>
                <input type="hidden" name="id" value={application.id} />
                <input type="hidden" name="isIbpaMember" value="true" />
                <DashboardPrimaryBtn type="submit" className="w-full">
                  <CheckCircle2 aria-hidden size={15} />
                  {adminT.detail.approveIbpaMember}
                </DashboardPrimaryBtn>
              </form>
              <form action={approveJuryApplicationAction}>
                <input type="hidden" name="id" value={application.id} />
                <input type="hidden" name="isIbpaMember" value="false" />
                <DashboardPrimaryBtn type="submit" className="w-full">
                  <CheckCircle2 aria-hidden size={15} />
                  {adminT.detail.approveNonMember}
                </DashboardPrimaryBtn>
              </form>
            </div>

            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
              {adminT.detail.approveWithoutPayment}
            </p>
            <form action={approveJuryApplicationWithoutPaymentAction} className="mt-2">
              <input type="hidden" name="id" value={application.id} />
              <button
                type="submit"
                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-[rgba(114,160,193,0.28)] bg-[var(--color-blue-wash)]/80 px-3.5 py-2 text-sm font-semibold leading-none text-[var(--color-blue)] shadow-[0_10px_24px_rgba(114,160,193,0.14)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-[rgba(114,160,193,0.42)] hover:bg-white active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)]"
              >
                <ShieldCheck aria-hidden size={15} />
                {adminT.detail.activateWithoutPayment}
              </button>
            </form>
            <p className="mt-1.5 text-xs leading-5 text-[var(--color-ink-muted)]">
              {adminT.detail.activateWithoutPaymentNote}
            </p>
          </div>
        ) : null}

        {canReject ? (
          <div className="mt-4 border-t border-[rgba(37,42,45,0.06)] pt-4">
            <form action={rejectJuryApplicationAction}>
              <input type="hidden" name="id" value={application.id} />
              <button
                type="submit"
                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-white/82 px-3.5 py-2 text-sm font-semibold leading-none text-red-700 shadow-[0_10px_24px_rgba(153,27,27,0.06)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-red-50 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
              >
                <XCircle aria-hidden size={15} />
                {adminT.detail.rejectApplication}
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
            {adminT.detail.statusOverride}
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--color-ink-muted)]">
            {adminT.detail.statusOverrideNote}
          </p>
          <form action={overrideJuryApplicationStatusAction} className="mt-2 flex flex-col gap-2">
            <input type="hidden" name="id" value={application.id} />
            <select name="status" defaultValue={application.status} className={dashboardSelectClass}>
              <option value="SUBMITTED">{adminT.statuses.SUBMITTED}</option>
              <option value="ADDITIONAL_INFO_REQUIRED">{adminT.statuses.ADDITIONAL_INFO_REQUIRED}</option>
              <option value="APPROVED">{adminT.statuses.APPROVED}</option>
              <option value="REJECTED">{adminT.statuses.REJECTED}</option>
              <option value="PAID">{adminT.statuses.PAID}</option>
            </select>
            <DashboardSecondaryBtn type="submit" className="w-full">
              {adminT.detail.setStatus}
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
        className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-[rgba(255,255,255,0.35)] bg-[var(--color-blue)]/92 px-3 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(114,160,193,0.3)] backdrop-blur-xl transition hover:bg-[#4d86ad] active:scale-[0.98]"
      >
        <CheckCircle2 aria-hidden size={15} />
        {adminT.detail.decision}
      </a>
      {canReject ? (
        <form action={rejectJuryApplicationAction} className="flex-1">
          <input type="hidden" name="id" value={application.id} />
          <button
            type="submit"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-white/85 px-3 py-2 text-sm font-semibold text-red-700 backdrop-blur-xl transition hover:bg-red-50 active:scale-[0.98]"
          >
            <XCircle aria-hidden size={15} />
            {adminT.detail.reject}
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
        { icon: <Mail aria-hidden size={13} />, label: application.email },
        { icon: <Phone aria-hidden size={13} />, label: application.phone },
        { icon: <MapPin aria-hidden size={13} />, label: `${application.city}, ${application.country}` },
        { icon: <CalendarClock aria-hidden size={13} />, label: formatAdminDate(application.submittedAt) },
      ]}
      actions={
        <>
          <DashboardSecondaryBtn href="/admin/jury-applications">
            <ArrowLeft aria-hidden size={15} />
            {adminT.common.back}
          </DashboardSecondaryBtn>
          <DashboardSecondaryBtn href={`/admin/jury-applications/${application.id}/edit`}>
            <Pencil aria-hidden size={15} />
            {adminT.common.edit}
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

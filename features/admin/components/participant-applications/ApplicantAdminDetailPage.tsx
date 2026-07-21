import type { ReactNode } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  FileText,
  Layers3,
  Mail,
  MailPlus,
  MapPin,
  MessageSquareText,
  Paperclip,
  Pencil,
  Phone,
  Plus,
  UserRound,
} from "lucide-react";
import {
  addManualApplicantNominationAction,
  resendApplicantRegistrationLinkAction,
  updateApplicantDeadlineOverrideAction,
  updateApplicantProfileAction,
} from "@/features/admin/actions/applicant.actions";
import ApplicationStatusBadge from "@/features/admin/components/badges/ApplicationStatusBadge";
import PaymentStatusBadge from "@/features/admin/components/badges/PaymentStatusBadge";
import AdminNominationBrowser, {
  type NominationBrowserItem,
} from "@/features/admin/components/review/AdminNominationBrowser";
import {
  ReviewActionPanel,
  ReviewSummaryCard,
} from "@/features/admin/components/review/ReviewPrimitives";
import ReviewWorkspace, {
  type ReviewTab,
} from "@/features/admin/components/review/ReviewWorkspace";
import type { getParticipantApplicationDetail } from "@/features/admin/server/participant-queries";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import { adminT, formatAdminDate, formatAdminMoney } from "@/lib/i18n/admin";
import {
  DashboardCard,
  DashboardChip,
  DashboardDetailCard,
  DashboardKpiBar,
  DashboardPanel,
  DashboardPrimaryBtn,
  DashboardSecondaryBtn,
  dashboardInputClass,
  dashboardSelectClass,
} from "@/shared/components/admin/DashboardUI";

type ApplicantAdminDetail = NonNullable<Awaited<ReturnType<typeof getParticipantApplicationDetail>>>;
type Nomination = ApplicantAdminDetail["profile"]["nominations"][number];
type Answer = Nomination["answers"][number];

function dateTimeLocal(value: Date | null | undefined) {
  if (!value) return "";
  return new Date(value.getTime() - value.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

function answerValue(answer: Answer) {
  if (Array.isArray(answer.valueJson)) {
    return answer.valueJson.filter((value): value is string => typeof value === "string").join(", ");
  }
  if (answer.valueNumber !== null) return String(answer.valueNumber);
  if (answer.valueBoolean !== null) return answer.valueBoolean ? adminT.common.yes : adminT.common.no;
  return answer.valueText || adminT.common.notProvided;
}

function fieldLabel(key: string, fallback: string) {
  return adminT.nominationFields[key] ?? fallback;
}

function paymentStatus(nominations: Nomination[]) {
  if (nominations.length > 0 && nominations.every((item) => item.paymentStatus === "PAID")) {
    return "PAID";
  }
  return nominations.find((item) => item.paymentStatus !== "PAID")?.paymentStatus ?? "PENDING";
}

function Alert({ tone, children }: { tone: "error" | "notice"; children?: string }) {
  if (!children) return null;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-[22px] border px-4 py-3 text-sm ${
        tone === "error"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-[rgba(114,160,193,0.25)] bg-[var(--color-blue-wash)] text-[var(--color-ink)]"
      }`}
    >
      {children}
    </div>
  );
}

function Section({ icon, title, children }: { icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <DashboardPanel>
      <div className="flex items-center gap-2 text-[var(--color-blue)]">
        {icon}
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em]">{title}</h3>
      </div>
      <div className="mt-4">{children}</div>
    </DashboardPanel>
  );
}

function AnswerGrid({ fields, answers, empty }: {
  fields: Array<{ key: string; label: string }>;
  answers: Answer[];
  empty: string;
}) {
  const answerMap = new Map(answers.map((answer) => [answer.fieldKey, answer]));
  const visible = fields.filter((field) => answerMap.has(field.key));
  if (visible.length === 0) {
    return <p className="text-sm text-[var(--color-ink-soft)]">{empty}</p>;
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {visible.map((field) => (
        <DashboardDetailCard
          key={field.key}
          label={fieldLabel(field.key, field.label)}
          value={answerValue(answerMap.get(field.key)!)}
        />
      ))}
    </div>
  );
}

function NominationContent({ nomination }: { nomination: Nomination }) {
  const fields = categoryFieldConfigs[nomination.category.slug] ?? [];
  const workFields = fields.filter((field) => field.type !== "textarea" && field.type !== "file");
  const descriptionFields = fields.filter((field) => field.type === "textarea");
  const fileFields = fields.filter((field) => field.type === "file");
  const submittedScores = nomination.reviews.filter(
    (score) => score.status === "COMPLETED" && score.totalScore !== null,
  );
  const averageScore = submittedScores.length
    ? submittedScores.reduce((sum, score) => sum + Number(score.totalScore), 0) / submittedScores.length
    : null;

  return (
    <DashboardCard className="p-0">
      <div className="border-b border-[rgba(114,160,193,0.14)] p-4 md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-blue)]">
              {nomination.category.name}
            </p>
            <h2 className="mt-1 font-[var(--font-title-family)] text-2xl font-light tracking-[-0.025em] text-[var(--color-ink)]">
              {nomination.award.name}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <ApplicationStatusBadge status={nomination.status} />
            <PaymentStatusBadge status={nomination.paymentStatus} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-4 md:p-5">
        <Section icon={<BriefcaseBusiness aria-hidden size={16} />} title={adminT.applicantAccount.workDetails}>
          <AnswerGrid fields={workFields} answers={nomination.answers} empty={adminT.applicantAccount.noWorkDetails} />
        </Section>

        <Section icon={<MessageSquareText aria-hidden size={16} />} title={adminT.applicantAccount.description}>
          <AnswerGrid fields={descriptionFields} answers={nomination.answers} empty={adminT.applicantAccount.noDescription} />
        </Section>

        <Section icon={<Paperclip aria-hidden size={16} />} title={adminT.applicantAccount.fileUploads}>
          {fileFields.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {fileFields.map((field) => {
                const files = nomination.files.filter((file) => file.fieldKey === field.key);
                return (
                  <div key={field.key} className="rounded-[22px] border border-[rgba(114,160,193,0.16)] bg-white/70 p-4">
                    <p className="text-xs font-semibold text-[var(--color-ink)]">
                      {fieldLabel(field.key, field.label)}
                    </p>
                    <div className="mt-3 grid gap-2">
                      {files.map((file) => (
                        <a
                          key={file.id}
                          href={`/api/admin/nomination-files/${file.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex min-h-10 items-center gap-2 rounded-[16px] border border-[rgba(114,160,193,0.2)] bg-white px-3 text-sm text-[var(--color-ink-soft)] transition hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.2)]"
                        >
                          <FileText aria-hidden size={15} className="shrink-0 text-[var(--color-blue)]" />
                          <span className="min-w-0 flex-1 truncate">{file.displayFileName || file.originalFileName || file.fileName}</span>
                        </a>
                      ))}
                      {files.length === 0 ? (
                        <p className="text-sm text-[var(--color-ink-soft)]">{adminT.applicantAccount.noFiles}</p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-[var(--color-ink-soft)]">{adminT.applicantAccount.noFileFields}</p>
          )}
        </Section>

        <Section icon={<CheckCircle2 aria-hidden size={16} />} title={adminT.applicantAccount.review}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardDetailCard label={adminT.applicantAccount.completion} value={`${nomination.completion.completionPercent}%`} />
            <DashboardDetailCard label={adminT.applicantAccount.missingRequired} value={nomination.completion.missingRequiredCount} />
            <DashboardDetailCard label={adminT.applicantAccount.submittedAt} value={nomination.submittedAt ? formatAdminDate(nomination.submittedAt) : adminT.common.notProvided} />
            <DashboardDetailCard label={adminT.applicantAccount.lockedAt} value={nomination.lockedAt ? formatAdminDate(nomination.lockedAt) : adminT.common.notProvided} />
            <DashboardDetailCard label={adminT.applicantAccount.scoreCount} value={submittedScores.length} />
            <DashboardDetailCard label={adminT.applicantAccount.averageScore} value={averageScore === null ? adminT.scoring.notScored : averageScore.toFixed(1)} />
          </div>
          <div className="mt-4">
            <DashboardKpiBar value={nomination.completion.completionPercent} label={adminT.applicantAccount.completion} />
          </div>
        </Section>
      </div>
    </DashboardCard>
  );
}

function ProfileEditForm({ profile }: { profile: ApplicantAdminDetail["profile"] }) {
  return (
    <details className="group rounded-[20px] border border-[rgba(114,160,193,0.16)] bg-white/62 p-3">
      <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
        <Pencil aria-hidden size={15} className="text-[var(--color-blue)]" />
        {adminT.common.edit}
      </summary>
      <form action={updateApplicantProfileAction} className="mt-3 grid gap-3">
        <input type="hidden" name="profileId" value={profile.id} />
        <input name="fullName" defaultValue={profile.fullName} className={dashboardInputClass} aria-label={adminT.applicantAccount.fullName} required />
        <input name="phone" defaultValue={profile.phone ?? ""} className={dashboardInputClass} aria-label={adminT.applicantAccount.phone} />
        <input name="country" defaultValue={profile.country ?? ""} className={dashboardInputClass} aria-label={adminT.applicantAccount.country} required />
        <input name="stateProvince" defaultValue={profile.stateProvince ?? ""} className={dashboardInputClass} aria-label={adminT.applicantAccount.stateProvince} />
        <input name="city" defaultValue={profile.city ?? ""} className={dashboardInputClass} aria-label={adminT.applicantAccount.city} required />
        <input name="professionalTitle" defaultValue={profile.professionalTitle ?? ""} className={dashboardInputClass} aria-label={adminT.applicantAccount.professionalTitle} />
        <input name="yearsExperience" type="number" min="0" defaultValue={profile.yearsExperience ?? ""} className={dashboardInputClass} aria-label={adminT.applicantAccount.yearsExperience} />
        <input name="membershipNumber" defaultValue={profile.membershipNumber ?? ""} className={dashboardInputClass} aria-label={adminT.applicantAccount.ibpaNumber} />
        <input name="membershipLevel" defaultValue={profile.membershipLevel ?? ""} className={dashboardInputClass} aria-label={adminT.applicantAccount.ibpaLevel} />
        <select name="preferredLocale" defaultValue={profile.preferredLocale} className={dashboardSelectClass} aria-label={adminT.applicantAccount.preferredLanguage}>
          <option value="en">{adminT.common.english}</option>
          <option value="ru">{adminT.common.russian}</option>
          <option value="ua">{adminT.common.ukrainian}</option>
        </select>
        <input name="websiteUrl" defaultValue={profile.websiteUrl ?? ""} className={dashboardInputClass} aria-label={adminT.common.instagram} />
        <input name="socialUrl" defaultValue={profile.socialUrl ?? ""} className={dashboardInputClass} aria-label={adminT.applicantAccount.socialUrl} />
        <input name="reviewsUrl" defaultValue={profile.reviewsUrl ?? ""} className={dashboardInputClass} aria-label={adminT.applicantAccount.reviewsUrl} />
        <DashboardPrimaryBtn type="submit" className="w-full">{adminT.applicantAccount.saveProfile}</DashboardPrimaryBtn>
      </form>
    </details>
  );
}

export default function ApplicantAdminDetailPage({
  data,
  error,
  notice,
}: {
  data: ApplicantAdminDetail;
  error?: string;
  notice?: string;
}) {
  const { profile, categories } = data;
  const ownedAwardIds = new Set(profile.nominations.map((nomination) => nomination.awardId));
  const hasPaidNomination = profile.nominations.some((nomination) => nomination.paymentStatus === "PAID");
  const registrationEligible = hasPaidNomination && !profile.account.passwordHash && profile.account.status !== "DISABLED";
  const availableAwardCount = categories.reduce(
    (sum, category) => sum + category.awards.filter((award) => !ownedAwardIds.has(award.id)).length,
    0,
  );
  const aggregatePayment = paymentStatus(profile.nominations);
  const paidCount = profile.nominations.filter((item) => item.paymentStatus === "PAID").length;
  const deliveryStatus = profile.account.lastSetupEmailDeliveryStatus
    ? adminT.applicantAccount.deliveryStatuses[profile.account.lastSetupEmailDeliveryStatus] ?? profile.account.lastSetupEmailDeliveryStatus
    : adminT.common.notProvided;

  const personal = (
    <div className="grid gap-4">
      <DashboardCard>
        <div className="flex items-center gap-2 text-[var(--color-blue)]">
          <UserRound aria-hidden size={16} />
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em]">{adminT.applicantAccount.personalInformation}</h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <DashboardDetailCard label={adminT.applicantAccount.fullName} value={profile.fullName} />
          <DashboardDetailCard label={adminT.applicantAccount.email} value={profile.account.email} />
          <DashboardDetailCard label={adminT.applicantAccount.phone} value={profile.phone || adminT.common.notProvided} />
          <DashboardDetailCard label={adminT.detail.location} value={[profile.city, profile.stateProvince, profile.country].filter(Boolean).join(", ") || adminT.common.notProvided} />
        </div>
      </DashboardCard>

      <DashboardCard>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardDetailCard label={adminT.applicantAccount.payment} value={<PaymentStatusBadge status={aggregatePayment} />} />
          <DashboardDetailCard label={adminT.applicantAccount.registrationStatus} value={profile.account.passwordHash ? adminT.applicantAccount.registered : adminT.applicantAccount.notRegistered} />
          <DashboardDetailCard label={adminT.applicantAccount.accountStatus} value={adminT.statuses[profile.account.status] ?? profile.account.status} />
          <DashboardDetailCard label={adminT.applicantAccount.createdAt} value={formatAdminDate(profile.account.createdAt)} />
        </div>
      </DashboardCard>
    </div>
  );

  const nominationItems: NominationBrowserItem[] = profile.nominations.map((nomination) => ({
    id: nomination.id,
    awardName: nomination.award.name,
    categoryName: nomination.category.name,
    meta: (
      <>
        <ApplicationStatusBadge status={nomination.status} />
        <span className="text-[11px] font-semibold text-[var(--color-ink-muted)]">
          {nomination.completion.completionPercent}%
        </span>
      </>
    ),
    content: <NominationContent nomination={nomination} />,
  }));

  const nominations = nominationItems.length > 0 ? (
    <AdminNominationBrowser items={nominationItems} listLabel={adminT.applicantAccount.paidNominations} />
  ) : (
    <DashboardCard>
      <p className="text-sm text-[var(--color-ink-soft)]">{adminT.applicantAccount.noNominations}</p>
    </DashboardCard>
  );

  const tabs: ReviewTab[] = [
    { key: "personal", label: adminT.applicantAccount.personalTab, icon: <UserRound aria-hidden size={15} />, content: personal },
    { key: "nominations", label: adminT.applicantAccount.nominationsTab, icon: <Layers3 aria-hidden size={15} />, content: nominations },
  ];

  const aside = (
    <ReviewActionPanel title={adminT.applicantAccount.actionsTitle} className="max-h-[calc(100vh-2.5rem)] overflow-y-auto">
      <div className="grid gap-3">
        <form action={resendApplicantRegistrationLinkAction}>
          <input type="hidden" name="profileId" value={profile.id} />
          <DashboardSecondaryBtn type="submit" disabled={!registrationEligible} className="w-full">
            <MailPlus aria-hidden size={15} />
            {adminT.applicantAccount.resendRegistration}
          </DashboardSecondaryBtn>
        </form>
        {!hasPaidNomination ? <p className="text-xs leading-5 text-[var(--color-ink-soft)]">{adminT.applicantAccount.paidRequired}</p> : null}

        <ProfileEditForm profile={profile} />

        <DashboardPanel>
          <div className="flex items-center gap-2 text-[var(--color-blue)]">
            <Plus aria-hidden size={15} />
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">{adminT.applicantAccount.manualNomination}</p>
          </div>
          <form action={addManualApplicantNominationAction} className="mt-3 grid gap-2">
            <input type="hidden" name="profileId" value={profile.id} />
            <select name="awardId" className={dashboardSelectClass} disabled={availableAwardCount === 0} required>
              <option value="">{adminT.applicantAccount.chooseNomination}</option>
              {categories.map((category) => (
                <optgroup key={category.id} label={category.name}>
                  {category.awards.map((award) => (
                    <option key={award.id} value={award.id} disabled={ownedAwardIds.has(award.id)}>{award.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <DashboardPrimaryBtn type="submit" disabled={availableAwardCount === 0} className="w-full">
              {adminT.applicantAccount.addPaidNomination}
            </DashboardPrimaryBtn>
          </form>
        </DashboardPanel>

        <DashboardPanel>
          <div className="flex items-center gap-2 text-[var(--color-blue)]">
            <CalendarClock aria-hidden size={15} />
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">{adminT.applicantAccount.deadlineExtension}</p>
          </div>
          <form action={updateApplicantDeadlineOverrideAction} className="mt-3 grid gap-2">
            <input type="hidden" name="profileId" value={profile.id} />
            <input type="datetime-local" name="deadlineOverrideAt" defaultValue={dateTimeLocal(profile.deadlineOverrideAt)} className={dashboardInputClass} />
            <DashboardSecondaryBtn type="submit" className="w-full">{adminT.applicantAccount.saveExtension}</DashboardSecondaryBtn>
          </form>
        </DashboardPanel>

        <DashboardPanel>
          <div className="flex items-center gap-2 text-[var(--color-blue)]">
            <Mail aria-hidden size={15} />
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">{adminT.applicantAccount.registrationEmail}</p>
          </div>
          <div className="mt-3 grid gap-2">
            <DashboardDetailCard label={adminT.applicantAccount.lastSent} value={profile.account.lastSetupEmailSentAt ? formatAdminDate(profile.account.lastSetupEmailSentAt) : adminT.common.notProvided} />
            <DashboardDetailCard label={adminT.applicantAccount.deliveryStatus} value={deliveryStatus} />
            {profile.account.lastSetupEmailDeliveryError ? <DashboardDetailCard label={adminT.applicantAccount.deliveryError} value={profile.account.lastSetupEmailDeliveryError} /> : null}
          </div>
        </DashboardPanel>
      </div>
    </ReviewActionPanel>
  );

  return (
    <ReviewWorkspace
      summary={
        <ReviewSummaryCard
          name={profile.fullName}
          subtitle={profile.account.email}
          badges={
            <>
              <PaymentStatusBadge status={aggregatePayment} />
              <DashboardChip>{adminT.statuses[profile.account.status] ?? profile.account.status}</DashboardChip>
            </>
          }
          meta={[
            { icon: <Layers3 aria-hidden size={13} />, label: `${adminT.applicantAccount.paidNominations}: ${paidCount}` },
            { icon: <CreditCard aria-hidden size={13} />, label: profile.payments[0] ? formatAdminMoney(profile.payments[0].amount, profile.payments[0].currency, 0) : adminT.common.notProvided },
            { icon: <Phone aria-hidden size={13} />, label: profile.phone || adminT.common.notProvided },
            { icon: <MapPin aria-hidden size={13} />, label: [profile.city, profile.country].filter(Boolean).join(", ") || adminT.common.notProvided },
          ]}
          actions={
            <DashboardSecondaryBtn href="/admin/applications">
              <ArrowLeft aria-hidden size={15} />
              {adminT.common.back}
            </DashboardSecondaryBtn>
          }
        />
      }
      alerts={error || notice ? <div className="grid gap-2"><Alert tone="error">{error}</Alert><Alert tone="notice">{notice}</Alert></div> : null}
      tabs={tabs}
      aside={aside}
    />
  );
}

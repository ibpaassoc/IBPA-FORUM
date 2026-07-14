import { ArrowLeft, CalendarClock, CreditCard, FileText, Layers3, MailPlus, Plus, UserRound } from "lucide-react";
import {
  addManualApplicantNominationAction,
  resendApplicantRegistrationLinkAction,
  updateApplicantDeadlineOverrideAction,
  updateApplicantProfileAction,
} from "@/features/admin/actions/applicant.actions";
import ApplicationStatusBadge from "@/features/admin/components/badges/ApplicationStatusBadge";
import PaymentStatusBadge from "@/features/admin/components/badges/PaymentStatusBadge";
import type { getParticipantApplicationDetail } from "@/features/admin/server/participant-queries";
import { adminT, formatAdminDate, formatAdminMoney } from "@/lib/i18n/admin";
import {
  DashboardCard,
  DashboardChip,
  DashboardDetailCard,
  DashboardPageHeader,
  DashboardPanel,
  DashboardPrimaryBtn,
  DashboardSecondaryBtn,
  dashboardInputClass,
  dashboardSelectClass,
} from "@/shared/components/admin/DashboardUI";

type ApplicantAdminDetail = NonNullable<Awaited<ReturnType<typeof getParticipantApplicationDetail>>>;

function dateTimeLocal(value: Date | null | undefined) {
  if (!value) return "";
  return new Date(value.getTime() - value.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

function Alert({ tone, children }: { tone: "error" | "notice"; children?: string }) {
  if (!children) return null;
  return (
    <div
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
  const registrationEligible =
    !profile.account.passwordHash && profile.account.status !== "DISABLED";
  const availableAwardCount = categories.reduce(
    (sum, category) => sum + category.awards.filter((award) => !ownedAwardIds.has(award.id)).length,
    0
  );

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        label={adminT.applicantAccount.label}
        title={profile.fullName}
        description={profile.account.email}
        actions={
          <>
            <DashboardSecondaryBtn href="/admin/applications">
              <ArrowLeft aria-hidden size={15} />
              {adminT.common.back}
            </DashboardSecondaryBtn>
            <form action={resendApplicantRegistrationLinkAction}>
              <input type="hidden" name="profileId" value={profile.id} />
              <DashboardSecondaryBtn type="submit" disabled={!registrationEligible}>
                <MailPlus aria-hidden size={15} />
                {adminT.applicantAccount.resendRegistration}
              </DashboardSecondaryBtn>
            </form>
          </>
        }
        meta={
          <div className="flex flex-wrap gap-2">
            <DashboardChip>{adminT.statuses[profile.account.status] ?? profile.account.status}</DashboardChip>
            {registrationEligible ? <DashboardChip>{adminT.applicantAccount.registrationIncomplete}</DashboardChip> : null}
            {profile.account.lastSetupEmailDeliveryStatus ? (
              <DashboardChip>{profile.account.lastSetupEmailDeliveryStatus}</DashboardChip>
            ) : null}
          </div>
        }
      />

      <Alert tone="error">{error}</Alert>
      <Alert tone="notice">{notice}</Alert>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="flex flex-col gap-5">
          <DashboardCard>
            <div className="flex items-center gap-2 text-[var(--color-blue)]">
              <UserRound aria-hidden size={16} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">{adminT.applicantAccount.personalInformation}</p>
            </div>
            <form action={updateApplicantProfileAction} className="mt-4 grid gap-3 md:grid-cols-2">
              <input type="hidden" name="profileId" value={profile.id} />
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">{adminT.applicantAccount.fullName}</span>
                <input name="fullName" defaultValue={profile.fullName} className={dashboardInputClass} required />
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">{adminT.applicantAccount.email}</span>
                <input value={profile.account.email} className={dashboardInputClass} disabled readOnly />
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">{adminT.applicantAccount.phone}</span>
                <input name="phone" defaultValue={profile.phone ?? ""} className={dashboardInputClass} />
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">{adminT.applicantAccount.country}</span>
                <input name="country" defaultValue={profile.country ?? ""} className={dashboardInputClass} required />
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">{adminT.applicantAccount.stateProvince}</span>
                <input name="stateProvince" defaultValue={profile.stateProvince ?? ""} className={dashboardInputClass} />
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">{adminT.applicantAccount.city}</span>
                <input name="city" defaultValue={profile.city ?? ""} className={dashboardInputClass} required />
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">{adminT.applicantAccount.professionalTitle}</span>
                <input name="professionalTitle" defaultValue={profile.professionalTitle ?? ""} className={dashboardInputClass} />
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">{adminT.applicantAccount.yearsExperience}</span>
                <input name="yearsExperience" type="number" min="0" defaultValue={profile.yearsExperience ?? ""} className={dashboardInputClass} />
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">{adminT.applicantAccount.ibpaNumber}</span>
                <input name="membershipNumber" defaultValue={profile.membershipNumber ?? ""} className={dashboardInputClass} />
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">{adminT.applicantAccount.ibpaLevel}</span>
                <input name="membershipLevel" defaultValue={profile.membershipLevel ?? ""} className={dashboardInputClass} />
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">{adminT.applicantAccount.preferredLanguage}</span>
                <select name="preferredLocale" defaultValue={profile.preferredLocale} className={dashboardSelectClass}>
                  <option value="en">English</option>
                  <option value="ru">Русский</option>
                  <option value="ua">Українська</option>
                </select>
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">Instagram</span>
                <input name="websiteUrl" defaultValue={profile.websiteUrl ?? ""} className={dashboardInputClass} />
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">{adminT.applicantAccount.socialUrl}</span>
                <input name="socialUrl" defaultValue={profile.socialUrl ?? ""} className={dashboardInputClass} />
              </label>
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">{adminT.applicantAccount.reviewsUrl}</span>
                <input name="reviewsUrl" defaultValue={profile.reviewsUrl ?? ""} className={dashboardInputClass} />
              </label>
              <div className="md:col-span-2">
                <DashboardPrimaryBtn type="submit">{adminT.applicantAccount.saveProfile}</DashboardPrimaryBtn>
              </div>
            </form>
          </DashboardCard>

          <DashboardCard>
            <div className="flex items-center gap-2 text-[var(--color-blue)]">
              <Layers3 aria-hidden size={16} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">{adminT.applicantAccount.ownedNominations}</p>
            </div>
            <div className="mt-4 grid gap-3">
              {profile.nominations.map((nomination) => (
                <DashboardPanel key={nomination.id}>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <ApplicationStatusBadge status={nomination.status} />
                        <PaymentStatusBadge status={nomination.paymentStatus} />
                        {nomination.closedIncompleteAt ? <DashboardChip>{adminT.applicantAccount.incompleteAtClosure}</DashboardChip> : null}
                      </div>
                      <h2 className="mt-3 text-lg font-semibold text-[var(--color-ink)]">{nomination.award.name}</h2>
                      <p className="text-sm text-[var(--color-ink-soft)]">{nomination.category.name}</p>
                    </div>
                    <div className="text-sm text-[var(--color-ink-soft)]">
                      <p>{adminT.applicantAccount.completion} {nomination.completion.completionPercent}%</p>
                      <p>{adminT.applicantAccount.missingRequired} {nomination.completion.missingRequiredCount}</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <DashboardDetailCard label={adminT.applicantAccount.submittedAt} value={nomination.submittedAt ? formatAdminDate(nomination.submittedAt) : adminT.common.notProvided} />
                    <DashboardDetailCard label={adminT.applicantAccount.lockedAt} value={nomination.lockedAt ? formatAdminDate(nomination.lockedAt) : adminT.common.notProvided} />
                    <DashboardDetailCard label={adminT.applicantAccount.filesCount} value={nomination.files.length} />
                  </div>
                </DashboardPanel>
              ))}
              {profile.nominations.length === 0 ? (
                <div className="rounded-[22px] border border-dashed border-[rgba(37,42,45,0.14)] bg-white/62 px-4 py-4 text-sm text-[var(--color-ink-soft)]">
                  {adminT.applicantAccount.noNominations}
                </div>
              ) : null}
            </div>
          </DashboardCard>
        </div>

        <aside className="flex flex-col gap-5">
          <DashboardCard>
            <div className="flex items-center gap-2 text-[var(--color-blue)]">
              <Plus aria-hidden size={16} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">{adminT.applicantAccount.manualNomination}</p>
            </div>
            <form action={addManualApplicantNominationAction} className="mt-4 grid gap-3">
              <input type="hidden" name="profileId" value={profile.id} />
              <select name="awardId" className={dashboardSelectClass} disabled={availableAwardCount === 0} required>
                <option value="">{adminT.applicantAccount.chooseNomination}</option>
                {categories.map((category) => (
                  <optgroup key={category.id} label={category.name}>
                    {category.awards.map((award) => (
                      <option key={award.id} value={award.id} disabled={ownedAwardIds.has(award.id)}>
                        {award.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <DashboardPrimaryBtn type="submit" disabled={availableAwardCount === 0}>
                {adminT.applicantAccount.addPaidNomination}
              </DashboardPrimaryBtn>
            </form>
          </DashboardCard>

          <DashboardCard>
            <div className="flex items-center gap-2 text-[var(--color-blue)]">
              <CalendarClock aria-hidden size={16} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">{adminT.applicantAccount.deadlineExtension}</p>
            </div>
            <form action={updateApplicantDeadlineOverrideAction} className="mt-4 grid gap-3">
              <input type="hidden" name="profileId" value={profile.id} />
              <input
                type="datetime-local"
                name="deadlineOverrideAt"
                defaultValue={dateTimeLocal(profile.deadlineOverrideAt)}
                className={dashboardInputClass}
              />
              <DashboardSecondaryBtn type="submit">{adminT.applicantAccount.saveExtension}</DashboardSecondaryBtn>
            </form>
          </DashboardCard>

          <DashboardCard>
            <div className="flex items-center gap-2 text-[var(--color-blue)]">
              <CreditCard aria-hidden size={16} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">{adminT.applicantAccount.payments}</p>
            </div>
            <div className="mt-4 grid gap-2">
              {profile.payments.map((payment) => (
                <div key={payment.id} className="rounded-[20px] border border-[rgba(37,42,45,0.08)] bg-white/66 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <PaymentStatusBadge status={payment.status} />
                    <span className="text-sm font-semibold text-[var(--color-ink)]">
                      {formatAdminMoney(payment.amount, payment.currency, 0)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[var(--color-ink-soft)]">
                    {payment.provider} / {formatAdminDate(payment.createdAt)}
                  </p>
                </div>
              ))}
              {profile.payments.length === 0 ? (
                <div className="rounded-[20px] border border-dashed border-[rgba(37,42,45,0.14)] bg-white/62 p-3 text-sm text-[var(--color-ink-soft)]">
                  {adminT.applicantAccount.noPayments}
                </div>
              ) : null}
            </div>
          </DashboardCard>

          <DashboardCard>
            <div className="flex items-center gap-2 text-[var(--color-blue)]">
              <FileText aria-hidden size={16} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">{adminT.applicantAccount.registrationEmail}</p>
            </div>
            <div className="mt-4 grid gap-3">
              <DashboardDetailCard label={adminT.applicantAccount.lastSent} value={profile.account.lastSetupEmailSentAt ? formatAdminDate(profile.account.lastSetupEmailSentAt) : adminT.common.notProvided} />
              <DashboardDetailCard label={adminT.applicantAccount.deliveryStatus} value={profile.account.lastSetupEmailDeliveryStatus ?? adminT.common.notProvided} />
              {profile.account.lastSetupEmailDeliveryError ? (
                <DashboardDetailCard label={adminT.applicantAccount.deliveryError} value={profile.account.lastSetupEmailDeliveryError} />
              ) : null}
            </div>
          </DashboardCard>
        </aside>
      </div>
    </div>
  );
}

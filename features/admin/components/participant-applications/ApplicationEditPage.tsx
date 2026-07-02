import type { ReactNode } from "react";
import type { Application, Award, Category } from "@prisma/client";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Globe,
  Save,
  UserRound,
} from "lucide-react";
import { editParticipantApplicationAction } from "@/features/admin/actions/participant.actions";
import { adminT, formatAdminMoney } from "@/lib/i18n/admin";
import ApplicationStatusBadge from "@/features/admin/components/badges/ApplicationStatusBadge";
import PaymentStatusBadge from "@/features/admin/components/badges/PaymentStatusBadge";
import {
  DashboardAccentBlock,
  DashboardCard,
  DashboardDetailCard,
  DashboardPageHeader,
  DashboardPrimaryBtn,
  DashboardSecondaryBtn,
  dashboardInputClass,
  dashboardTextareaClass,
} from "@/shared/components/admin/DashboardUI";

type ApplicationWithRelations = Application & {
  category: Category;
  award: Award;
};

function SectionHeader({
  icon: Icon,
  label,
}: {
  icon: typeof UserRound;
  label: string;
}) {
  return (
    <div className="border-b border-[rgba(37,42,45,0.08)] p-4 md:p-5">
      <div className="flex items-center gap-2 text-[var(--color-blue)]">
        <Icon aria-hidden size={16} />
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">{label}</p>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">{label}</p>
      {children}
    </div>
  );
}

function formatAmount(amount: number, currency: string) {
  return formatAdminMoney(amount, currency, 0);
}

export default function ApplicationEditPage({
  application,
}: {
  application: ApplicationWithRelations;
}) {
  return (
    <form action={editParticipantApplicationAction} className="flex flex-col gap-5">
      <input type="hidden" name="id" value={application.id} />

      <DashboardPageHeader
        label={adminT.edit.label}
        title={application.fullName}
        description={adminT.edit.description}
        actions={
          <DashboardSecondaryBtn href={`/admin/applications/${application.id}`}>
            <ArrowLeft aria-hidden size={15} />
            {adminT.common.cancel}
          </DashboardSecondaryBtn>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-5">
          <DashboardCard className="p-0">
            <SectionHeader icon={UserRound} label={adminT.edit.identity} />
            <div className="grid gap-4 p-4 sm:grid-cols-2 md:p-5">
              <FormField label={`${adminT.detail.fullLegalName} *`}>
                <input
                  type="text"
                  name="fullName"
                  defaultValue={application.fullName}
                  required
                  className={dashboardInputClass}
                />
              </FormField>
              <FormField label={`${adminT.detail.email} *`}>
                <input
                  type="email"
                  name="email"
                  defaultValue={application.email}
                  required
                  className={dashboardInputClass}
                />
              </FormField>
              <FormField label={`${adminT.detail.phoneWhatsapp} *`}>
                <input
                  type="text"
                  name="phone"
                  defaultValue={application.phone}
                  required
                  className={dashboardInputClass}
                />
              </FormField>
              <FormField label={`${adminT.edit.country} *`}>
                <input
                  type="text"
                  name="country"
                  defaultValue={application.country}
                  required
                  className={dashboardInputClass}
                />
              </FormField>
              <FormField label={adminT.detail.stateProvince}>
                <input
                  type="text"
                  name="stateProvince"
                  defaultValue={application.stateProvince ?? ""}
                  className={dashboardInputClass}
                />
              </FormField>
              <FormField label={`${adminT.edit.city} *`}>
                <input
                  type="text"
                  name="city"
                  defaultValue={application.city}
                  required
                  className={dashboardInputClass}
                />
              </FormField>
              <FormField label={adminT.edit.heardAbout}>
                <input
                  type="text"
                  name="heardAbout"
                  defaultValue={application.heardAbout ?? ""}
                  className={dashboardInputClass}
                />
              </FormField>
            </div>
          </DashboardCard>

          <DashboardCard className="p-0">
            <SectionHeader icon={BriefcaseBusiness} label={adminT.edit.professionalDetails} />
            <div className="grid gap-4 p-4 sm:grid-cols-2 md:p-5">
              <FormField label={`${adminT.detail.professionalTitle} *`}>
                <input
                  type="text"
                  name="professionalTitle"
                  defaultValue={application.professionalTitle}
                  required
                  className={dashboardInputClass}
                />
              </FormField>
              <FormField label={adminT.detail.yearsExperience}>
                <input
                  type="number"
                  name="yearsExperience"
                  defaultValue={application.yearsExperience}
                  min={0}
                  max={70}
                  className={dashboardInputClass}
                />
              </FormField>
              <FormField label={adminT.detail.membershipNumber}>
                <input
                  type="text"
                  name="membershipNumber"
                  defaultValue={application.membershipNumber ?? ""}
                  className={dashboardInputClass}
                />
              </FormField>
              <FormField label={adminT.detail.membershipLevel}>
                <input
                  type="text"
                  name="membershipLevel"
                  defaultValue={application.membershipLevel ?? ""}
                  className={dashboardInputClass}
                />
              </FormField>
            </div>
          </DashboardCard>

          <DashboardCard className="p-0">
            <SectionHeader icon={Globe} label={adminT.edit.onlinePresence} />
            <div className="flex flex-col gap-4 p-4 md:p-5">
              <FormField label={adminT.detail.website}>
                <input
                  type="text"
                  name="websiteUrl"
                  defaultValue={application.websiteUrl ?? ""}
                  placeholder="https://"
                  className={dashboardInputClass}
                />
              </FormField>
              <FormField label={adminT.detail.social}>
                <input
                  type="text"
                  name="socialUrl"
                  defaultValue={application.socialUrl ?? ""}
                  placeholder="https://"
                  className={dashboardInputClass}
                />
              </FormField>
              <FormField label={adminT.detail.clientReviews}>
                <textarea
                  name="reviewsUrl"
                  defaultValue={application.reviewsUrl ?? ""}
                  rows={2}
                  placeholder="https://"
                  className={dashboardTextareaClass}
                  style={{ minHeight: "64px" }}
                />
              </FormField>
            </div>
          </DashboardCard>
        </div>

        <aside className="flex flex-col gap-4 xl:sticky xl:top-5 xl:self-start">
          <DashboardAccentBlock>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90">
              {adminT.edit.currentStatus}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <ApplicationStatusBadge status={application.status} />
              <PaymentStatusBadge status={application.paymentStatus} />
            </div>
          </DashboardAccentBlock>

          <DashboardCard>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-blue)]">
              {adminT.edit.readOnly}
            </p>
            <div className="mt-3 grid gap-2">
              <DashboardDetailCard label={adminT.edit.category} value={application.category.name} />
              <DashboardDetailCard label={adminT.edit.award} value={application.award.name} />
              <DashboardDetailCard
                label={adminT.edit.entryFee}
                value={formatAmount(application.amount, application.currency)}
              />
            </div>
          </DashboardCard>

          <DashboardCard>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-blue)]">
              {adminT.edit.saveChanges}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <DashboardPrimaryBtn type="submit" className="w-full">
                <Save aria-hidden size={15} />
                {adminT.edit.saveChanges}
              </DashboardPrimaryBtn>
              <DashboardSecondaryBtn
                href={`/admin/applications/${application.id}`}
                className="w-full"
              >
                {adminT.common.cancel}
              </DashboardSecondaryBtn>
            </div>
          </DashboardCard>
        </aside>
      </div>
    </form>
  );
}

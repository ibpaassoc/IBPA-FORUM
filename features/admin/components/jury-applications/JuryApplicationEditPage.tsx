import type { ReactNode } from "react";
import type { JuryApplication } from "@prisma/client";
import {
  ArrowLeft,
  Award,
  BriefcaseBusiness,
  Globe,
  Save,
  UserRound,
} from "lucide-react";
import { editJuryApplicationAction } from "@/features/admin/actions/jury.actions";
import { adminT } from "@/lib/i18n/admin";
import ApplicationStatusBadge from "@/features/admin/components/badges/ApplicationStatusBadge";
import PaymentStatusBadge from "@/features/admin/components/badges/PaymentStatusBadge";
import {
  DashboardAccentBlock,
  DashboardCard,
  DashboardPageHeader,
  DashboardPrimaryBtn,
  DashboardSecondaryBtn,
  dashboardInputClass,
  dashboardTextareaClass,
} from "@/shared/components/admin/DashboardUI";
import IbpaDropdown from "@/shared/components/admin/IbpaDropdown";

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

export default function JuryApplicationEditPage({
  application,
}: {
  application: JuryApplication;
}) {
  const expertiseAreasValue = application.expertiseAreas.join(", ");

  return (
    <form action={editJuryApplicationAction} className="flex flex-col gap-5">
      <input type="hidden" name="id" value={application.id} />

      <DashboardPageHeader
        label={adminT.edit.juryLabel}
        title={application.fullName}
        description={adminT.edit.description}
        actions={
          <DashboardSecondaryBtn href={`/admin/jury-applications/${application.id}`}>
            <ArrowLeft aria-hidden size={15} />
            {adminT.common.cancel}
          </DashboardSecondaryBtn>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-5">
          <DashboardCard className="p-0">
            <SectionHeader icon={UserRound} label={adminT.edit.personalInfo} />
            <div className="grid gap-4 p-4 sm:grid-cols-2 md:p-5">
              <FormField label={`${adminT.detail.fullName} *`}>
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
              <FormField label={`${adminT.detail.phone} *`}>
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
              <FormField label={`${adminT.edit.city} *`}>
                <input
                  type="text"
                  name="city"
                  defaultValue={application.city}
                  required
                  className={dashboardInputClass}
                />
              </FormField>
              <FormField label={`${adminT.detail.professionalTitle} *`}>
                <input
                  type="text"
                  name="professionalTitle"
                  defaultValue={application.professionalTitle}
                  required
                  className={dashboardInputClass}
                />
              </FormField>
              <FormField label={adminT.detail.employer}>
                <input
                  type="text"
                  name="employerAffiliation"
                  defaultValue={application.employerAffiliation}
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
            </div>
          </DashboardCard>

          <DashboardCard className="p-0">
            <SectionHeader icon={Award} label={adminT.edit.membership} />
            <div className="grid gap-4 p-4 sm:grid-cols-2 md:p-5">
              <FormField label={adminT.detail.ibpaMember}>
                <IbpaDropdown
                  name="ibpaAssociationMember"
                  defaultValue={application.ibpaAssociationMember ? "true" : "false"}
                  ariaLabel={adminT.detail.ibpaMember}
                  options={[
                    { value: "false", label: adminT.common.no },
                    { value: "true", label: adminT.common.yes },
                  ]}
                />
              </FormField>
              <FormField label={adminT.detail.ibpaNumber}>
                <input
                  type="text"
                  name="ibpaNumber"
                  defaultValue={application.ibpaNumber ?? ""}
                  placeholder={adminT.edit.ifApplicable}
                  className={dashboardInputClass}
                />
              </FormField>
              <FormField label={adminT.detail.membershipStatus}>
                <input
                  type="text"
                  name="membershipStatus"
                  defaultValue={application.membershipStatus ?? ""}
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
            <SectionHeader icon={BriefcaseBusiness} label={adminT.edit.expertise} />
            <div className="flex flex-col gap-4 p-4 md:p-5">
              <FormField label={adminT.edit.expertiseAreasComma}>
                <input
                  type="text"
                  name="expertiseAreas"
                  defaultValue={expertiseAreasValue}
                  placeholder={adminT.edit.expertisePlaceholder}
                  className={dashboardInputClass}
                />
              </FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label={adminT.detail.previousJudging}>
                  <IbpaDropdown
                    name="previousJudgingExperience"
                    defaultValue={application.previousJudgingExperience ? "true" : "false"}
                    ariaLabel={adminT.detail.previousJudging}
                    options={[
                      { value: "false", label: adminT.common.no },
                      { value: "true", label: adminT.common.yes },
                    ]}
                  />
                </FormField>
              </div>
              <FormField label={adminT.edit.previousJudgingDetails}>
                <textarea
                  name="previousJudgingDetails"
                  defaultValue={application.previousJudgingDetails ?? ""}
                  rows={3}
                  placeholder={adminT.edit.previousJudgingPlaceholder}
                  className={dashboardTextareaClass}
                />
              </FormField>
            </div>
          </DashboardCard>

          <DashboardCard className="p-0">
            <SectionHeader icon={Globe} label={adminT.edit.bio} />
            <div className="flex flex-col gap-4 p-4 md:p-5">
              <FormField label={`${adminT.detail.professionalBio} *`}>
                <textarea
                  name="professionalBio"
                  defaultValue={application.professionalBio}
                  rows={5}
                  required
                  className={dashboardTextareaClass}
                />
              </FormField>
              <FormField label={adminT.detail.websiteLinkedin}>
                <input
                  type="text"
                  name="professionalWebsite"
                  defaultValue={application.professionalWebsite ?? ""}
                  placeholder="https://"
                  className={dashboardInputClass}
                />
              </FormField>
              <FormField label={`${adminT.detail.conflictDisclosure} *`}>
                <textarea
                  name="conflictDisclosure"
                  defaultValue={application.conflictDisclosure}
                  rows={4}
                  required
                  className={dashboardTextareaClass}
                />
              </FormField>
              <FormField label={`${adminT.detail.motivation} *`}>
                <textarea
                  name="motivation"
                  defaultValue={application.motivation}
                  rows={4}
                  required
                  className={dashboardTextareaClass}
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
              {adminT.edit.saveChanges}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <DashboardPrimaryBtn type="submit" className="w-full">
                <Save aria-hidden size={15} />
                {adminT.edit.saveChanges}
              </DashboardPrimaryBtn>
              <DashboardSecondaryBtn
                href={`/admin/jury-applications/${application.id}`}
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

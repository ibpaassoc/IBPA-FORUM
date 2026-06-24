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
import ApplicationStatusBadge from "@/features/admin/components/badges/ApplicationStatusBadge";
import PaymentStatusBadge from "@/features/admin/components/badges/PaymentStatusBadge";
import {
  DashboardAccentBlock,
  DashboardCard,
  DashboardPageHeader,
  DashboardPrimaryBtn,
  DashboardSecondaryBtn,
  dashboardInputClass,
  dashboardSelectClass,
  dashboardTextareaClass,
} from "@/shared/components/admin/DashboardUI";

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
        label="Edit jury application"
        title={application.fullName}
        description="Changes take effect immediately and do not trigger any emails or status changes."
        actions={
          <DashboardSecondaryBtn href={`/admin/jury-applications/${application.id}`}>
            <ArrowLeft aria-hidden size={15} />
            Cancel
          </DashboardSecondaryBtn>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-5">
          <DashboardCard className="p-0">
            <SectionHeader icon={UserRound} label="Personal information" />
            <div className="grid gap-4 p-4 sm:grid-cols-2 md:p-5">
              <FormField label="Full name *">
                <input
                  type="text"
                  name="fullName"
                  defaultValue={application.fullName}
                  required
                  className={dashboardInputClass}
                />
              </FormField>
              <FormField label="Email address *">
                <input
                  type="email"
                  name="email"
                  defaultValue={application.email}
                  required
                  className={dashboardInputClass}
                />
              </FormField>
              <FormField label="Phone number *">
                <input
                  type="text"
                  name="phone"
                  defaultValue={application.phone}
                  required
                  className={dashboardInputClass}
                />
              </FormField>
              <FormField label="Country *">
                <input
                  type="text"
                  name="country"
                  defaultValue={application.country}
                  required
                  className={dashboardInputClass}
                />
              </FormField>
              <FormField label="City *">
                <input
                  type="text"
                  name="city"
                  defaultValue={application.city}
                  required
                  className={dashboardInputClass}
                />
              </FormField>
              <FormField label="Professional title *">
                <input
                  type="text"
                  name="professionalTitle"
                  defaultValue={application.professionalTitle}
                  required
                  className={dashboardInputClass}
                />
              </FormField>
              <FormField label="Employer / Affiliation">
                <input
                  type="text"
                  name="employerAffiliation"
                  defaultValue={application.employerAffiliation}
                  className={dashboardInputClass}
                />
              </FormField>
              <FormField label="Years of experience">
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
            <SectionHeader icon={Award} label="Membership" />
            <div className="grid gap-4 p-4 sm:grid-cols-2 md:p-5">
              <FormField label="IBPA association member">
                <select
                  name="ibpaAssociationMember"
                  defaultValue={application.ibpaAssociationMember ? "true" : "false"}
                  className={dashboardSelectClass}
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </FormField>
              <FormField label="IBPA number">
                <input
                  type="text"
                  name="ibpaNumber"
                  defaultValue={application.ibpaNumber ?? ""}
                  placeholder="If applicable"
                  className={dashboardInputClass}
                />
              </FormField>
              <FormField label="Membership status">
                <input
                  type="text"
                  name="membershipStatus"
                  defaultValue={application.membershipStatus ?? ""}
                  className={dashboardInputClass}
                />
              </FormField>
              <FormField label="Membership level">
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
            <SectionHeader icon={BriefcaseBusiness} label="Expertise and judging history" />
            <div className="flex flex-col gap-4 p-4 md:p-5">
              <FormField label="Expertise areas (comma-separated)">
                <input
                  type="text"
                  name="expertiseAreas"
                  defaultValue={expertiseAreasValue}
                  placeholder="e.g. Wedding, Portrait, Commercial"
                  className={dashboardInputClass}
                />
              </FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Previous judging experience">
                  <select
                    name="previousJudgingExperience"
                    defaultValue={application.previousJudgingExperience ? "true" : "false"}
                    className={dashboardSelectClass}
                  >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </FormField>
              </div>
              <FormField label="Previous judging details">
                <textarea
                  name="previousJudgingDetails"
                  defaultValue={application.previousJudgingDetails ?? ""}
                  rows={3}
                  placeholder="Describe previous experience if applicable"
                  className={dashboardTextareaClass}
                />
              </FormField>
            </div>
          </DashboardCard>

          <DashboardCard className="p-0">
            <SectionHeader icon={Globe} label="Bio and statements" />
            <div className="flex flex-col gap-4 p-4 md:p-5">
              <FormField label="Professional bio *">
                <textarea
                  name="professionalBio"
                  defaultValue={application.professionalBio}
                  rows={5}
                  required
                  className={dashboardTextareaClass}
                />
              </FormField>
              <FormField label="Professional website / LinkedIn">
                <input
                  type="text"
                  name="professionalWebsite"
                  defaultValue={application.professionalWebsite ?? ""}
                  placeholder="https://"
                  className={dashboardInputClass}
                />
              </FormField>
              <FormField label="Conflict disclosure *">
                <textarea
                  name="conflictDisclosure"
                  defaultValue={application.conflictDisclosure}
                  rows={4}
                  required
                  className={dashboardTextareaClass}
                />
              </FormField>
              <FormField label="Motivation - why they want to judge *">
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
              Current status
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <ApplicationStatusBadge status={application.status} />
              <PaymentStatusBadge status={application.paymentStatus} />
            </div>
            <p className="mt-3 text-sm leading-6 text-white/70">
              Editing will not change the status or send any notifications.
            </p>
          </DashboardAccentBlock>

          <DashboardCard>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-blue)]">
              Save changes
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-ink-soft)]">
              All updated fields are saved immediately to the database.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <DashboardPrimaryBtn type="submit" className="w-full">
                <Save aria-hidden size={15} />
                Save changes
              </DashboardPrimaryBtn>
              <DashboardSecondaryBtn
                href={`/admin/jury-applications/${application.id}`}
                className="w-full"
              >
                Cancel
              </DashboardSecondaryBtn>
            </div>
          </DashboardCard>
        </aside>
      </div>
    </form>
  );
}

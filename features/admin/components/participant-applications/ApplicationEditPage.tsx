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
    <div className="border-b border-black/10 p-4 md:p-5">
      <div className="flex items-center gap-2 text-[#1673A5]">
        <Icon aria-hidden size={16} />
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">{label}</p>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-black/50">{label}</p>
      {children}
    </div>
  );
}

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(amount / 100);
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
        label="Edit application"
        title={application.fullName}
        description="Changes take effect immediately and do not trigger any emails or status changes."
        actions={
          <DashboardSecondaryBtn href={`/admin/applications/${application.id}`}>
            <ArrowLeft aria-hidden size={15} />
            Cancel
          </DashboardSecondaryBtn>
        }
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-5">
          <DashboardCard className="p-0">
            <SectionHeader icon={UserRound} label="Identity" />
            <div className="grid gap-4 p-4 sm:grid-cols-2 md:p-5">
              <FormField label="Full legal name *">
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
              <FormField label="Phone / WhatsApp *">
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
              <FormField label="State / Province">
                <input
                  type="text"
                  name="stateProvince"
                  defaultValue={application.stateProvince ?? ""}
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
              <FormField label="How they heard about us">
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
            <SectionHeader icon={BriefcaseBusiness} label="Professional details" />
            <div className="grid gap-4 p-4 sm:grid-cols-2 md:p-5">
              <FormField label="Professional title *">
                <input
                  type="text"
                  name="professionalTitle"
                  defaultValue={application.professionalTitle}
                  required
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
              <FormField label="IBPA membership no.">
                <input
                  type="text"
                  name="membershipNumber"
                  defaultValue={application.membershipNumber ?? ""}
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
            <SectionHeader icon={Globe} label="Online presence" />
            <div className="flex flex-col gap-4 p-4 md:p-5">
              <FormField label="Website">
                <input
                  type="text"
                  name="websiteUrl"
                  defaultValue={application.websiteUrl ?? ""}
                  placeholder="https://"
                  className={dashboardInputClass}
                />
              </FormField>
              <FormField label="Instagram / Social profile">
                <input
                  type="text"
                  name="socialUrl"
                  defaultValue={application.socialUrl ?? ""}
                  placeholder="https://"
                  className={dashboardInputClass}
                />
              </FormField>
              <FormField label="Client reviews URL">
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
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1673A5]">
              Read-only
            </p>
            <div className="mt-3 grid gap-2">
              <DashboardDetailCard label="Category" value={application.category.name} />
              <DashboardDetailCard label="Award" value={application.award.name} />
              <DashboardDetailCard
                label="Entry fee"
                value={formatAmount(application.amount, application.currency)}
              />
            </div>
          </DashboardCard>

          <DashboardCard>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1673A5]">
              Save changes
            </p>
            <p className="mt-2 text-sm leading-6 text-black/55">
              All updated fields are saved immediately.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <DashboardPrimaryBtn type="submit" className="w-full">
                <Save aria-hidden size={15} />
                Save changes
              </DashboardPrimaryBtn>
              <DashboardSecondaryBtn
                href={`/admin/applications/${application.id}`}
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

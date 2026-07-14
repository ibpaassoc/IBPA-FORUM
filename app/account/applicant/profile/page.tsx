import { BadgeCheck, Globe, Link2, MapPin, Star, UserRound } from "lucide-react";
import { requireApplicantAccount } from "@/features/account/server/accounts";
import { formatDateLabel } from "@/features/account/components/nomination-presentation";
import {
  DashboardDetailCard,
  DashboardPageHeader,
  DashboardStagger,
  GlassCard,
  StatusBadge,
} from "@/shared/components/admin/DashboardUI";

function value(input: string | number | null | undefined) {
  return input === null || input === undefined || input === "" ? "Not set" : String(input);
}

function ProfileLink({ href }: { href: string | null }) {
  if (!href) return <>Not set</>;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="break-all text-[var(--color-blue)] underline-offset-2 transition hover:text-[#4d86ad] hover:underline"
    >
      {href}
    </a>
  );
}

export default async function ApplicantProfilePage() {
  const { account, applicantProfile } = await requireApplicantAccount();
  const location = [applicantProfile.city, applicantProfile.stateProvince, applicantProfile.country]
    .filter(Boolean)
    .join(", ");
  const isVerifiedMember = Boolean(
    applicantProfile.membershipNumber && applicantProfile.membershipLevel,
  );

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        label="Applicant account"
        title="Profile"
        description="These details are attached to every nomination you submit. To correct anything, contact our support team."
      />

      <GlassCard className="p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[var(--color-blue-wash)] font-[var(--font-title-family)] text-2xl text-[var(--color-blue)] shadow-sm">
            {applicantProfile.fullName.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-[var(--font-title-family)] text-[clamp(1.6rem,3vw,2.2rem)] font-light leading-tight text-[var(--color-ink)]">
              {applicantProfile.fullName}
            </h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--color-ink-soft)]">
              <span className="inline-flex items-center gap-1.5">
                <UserRound aria-hidden size={14} className="text-[var(--color-blue)]" />
                {account.email}
              </span>
              {location ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin aria-hidden size={14} className="text-[var(--color-blue)]" />
                  {location}
                </span>
              ) : null}
            </p>
          </div>
          {isVerifiedMember ? (
            <StatusBadge tone="green" className="shrink-0">
              <BadgeCheck aria-hidden size={13} className="mr-1.5" />
              Verified member
            </StatusBadge>
          ) : null}
        </div>
      </GlassCard>

      <DashboardStagger className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <DashboardDetailCard label="Phone" value={value(applicantProfile.phone)} />
        <DashboardDetailCard label="Professional title" value={value(applicantProfile.professionalTitle)} />
        <DashboardDetailCard
          label="Years of experience"
          value={value(applicantProfile.yearsExperience)}
        />
        <DashboardDetailCard label="Country" value={value(applicantProfile.country)} />
        <DashboardDetailCard label="State / province" value={value(applicantProfile.stateProvince)} />
        <DashboardDetailCard label="City" value={value(applicantProfile.city)} />
      </DashboardStagger>

      <div className="grid items-start gap-5 xl:grid-cols-2">
        <GlassCard className="p-5">
          <h2 className="inline-flex items-center gap-2 font-[var(--font-title-family)] text-[1.4rem] font-light text-[var(--color-ink)]">
            <Star aria-hidden size={17} className="text-[var(--color-blue)]" />
            IBPA membership
          </h2>
          <div className="mt-4 grid gap-3">
            <DashboardDetailCard
              label="Membership number"
              value={value(applicantProfile.membershipNumber)}
            />
            <DashboardDetailCard
              label="Membership level"
              value={value(applicantProfile.membershipLevel)}
            />
            <DashboardDetailCard
              label="Verified"
              value={
                applicantProfile.membershipVerifiedAt
                  ? formatDateLabel(applicantProfile.membershipVerifiedAt)
                  : "Not verified"
              }
            />
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h2 className="inline-flex items-center gap-2 font-[var(--font-title-family)] text-[1.4rem] font-light text-[var(--color-ink)]">
            <Globe aria-hidden size={17} className="text-[var(--color-blue)]" />
            Public links
          </h2>
          <div className="mt-4 grid gap-3">
            <DashboardDetailCard
              label="Website"
              value={<ProfileLink href={applicantProfile.websiteUrl} />}
            />
            <DashboardDetailCard
              label="Social profile"
              value={<ProfileLink href={applicantProfile.socialUrl} />}
            />
            <DashboardDetailCard
              label="Reviews"
              value={<ProfileLink href={applicantProfile.reviewsUrl} />}
            />
          </div>
          <p className="mt-4 inline-flex items-center gap-2 text-[0.8rem] leading-5 text-[var(--color-ink-soft)]">
            <Link2 aria-hidden size={14} className="shrink-0 text-[var(--color-blue)]" />
            Links may be shown to the jury alongside your nominations.
          </p>
        </GlassCard>
      </div>
    </div>
  );
}

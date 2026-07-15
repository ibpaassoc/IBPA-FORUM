import { BadgeCheck, Globe, Link2, MapPin, Star, UserRound } from "lucide-react";
import { requireApplicantAccount } from "@/features/account/server/accounts";
import { formatDateLabel } from "@/features/account/components/nomination-presentation";
import { getServerLanguage, getServerTranslations } from "@/lib/i18n/server";
import {
  DashboardDetailCard,
  DashboardPageHeader,
  DashboardStagger,
  GlassCard,
  StatusBadge,
} from "@/shared/components/admin/DashboardUI";

function value(input: string | number | null | undefined, notSet: string) {
  return input === null || input === undefined || input === "" ? notSet : String(input);
}

function ProfileLink({ href, notSet }: { href: string | null; notSet: string }) {
  if (!href) return <>{notSet}</>;
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
  const [{ account, applicantProfile }, language, t] = await Promise.all([
    requireApplicantAccount(),
    getServerLanguage(),
    getServerTranslations(),
  ]);
  const pr = t.account.profile;
  const location = [applicantProfile.city, applicantProfile.stateProvince, applicantProfile.country]
    .filter(Boolean)
    .join(", ");
  const isVerifiedMember = Boolean(
    applicantProfile.membershipNumber && applicantProfile.membershipLevel,
  );

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        label={t.account.nav.brand}
        title={pr.title}
        description={pr.description}
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
              {pr.verifiedMember}
            </StatusBadge>
          ) : null}
        </div>
      </GlassCard>

      <DashboardStagger className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <DashboardDetailCard label={pr.phone} value={value(applicantProfile.phone, pr.notSet)} />
        <DashboardDetailCard label={pr.professionalTitle} value={value(applicantProfile.professionalTitle, pr.notSet)} />
        <DashboardDetailCard
          label={pr.yearsExperience}
          value={value(applicantProfile.yearsExperience, pr.notSet)}
        />
        <DashboardDetailCard label={pr.country} value={value(applicantProfile.country, pr.notSet)} />
        <DashboardDetailCard label={pr.stateProvince} value={value(applicantProfile.stateProvince, pr.notSet)} />
        <DashboardDetailCard label={pr.city} value={value(applicantProfile.city, pr.notSet)} />
      </DashboardStagger>

      <div className="grid items-start gap-5 xl:grid-cols-2">
        <GlassCard className="p-5">
          <h2 className="inline-flex items-center gap-2 font-[var(--font-title-family)] text-[1.4rem] font-light text-[var(--color-ink)]">
            <Star aria-hidden size={17} className="text-[var(--color-blue)]" />
            {pr.membership}
          </h2>
          <div className="mt-4 grid gap-3">
            <DashboardDetailCard
              label={pr.membershipNumber}
              value={value(applicantProfile.membershipNumber, pr.notSet)}
            />
            <DashboardDetailCard
              label={pr.membershipLevel}
              value={value(applicantProfile.membershipLevel, pr.notSet)}
            />
            <DashboardDetailCard
              label={pr.verified}
              value={
                applicantProfile.membershipVerifiedAt
                  ? formatDateLabel(applicantProfile.membershipVerifiedAt, language)
                  : pr.notVerified
              }
            />
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <h2 className="inline-flex items-center gap-2 font-[var(--font-title-family)] text-[1.4rem] font-light text-[var(--color-ink)]">
            <Globe aria-hidden size={17} className="text-[var(--color-blue)]" />
            {pr.publicLinks}
          </h2>
          <div className="mt-4 grid gap-3">
            <DashboardDetailCard
              label={pr.website}
              value={<ProfileLink href={applicantProfile.websiteUrl} notSet={pr.notSet} />}
            />
            <DashboardDetailCard
              label={pr.socialProfile}
              value={<ProfileLink href={applicantProfile.socialUrl} notSet={pr.notSet} />}
            />
            <DashboardDetailCard
              label={pr.reviews}
              value={<ProfileLink href={applicantProfile.reviewsUrl} notSet={pr.notSet} />}
            />
          </div>
          <p className="mt-4 inline-flex items-center gap-2 text-[0.8rem] leading-5 text-[var(--color-ink-soft)]">
            <Link2 aria-hidden size={14} className="shrink-0 text-[var(--color-blue)]" />
            {pr.linksNote}
          </p>
        </GlassCard>
      </div>
    </div>
  );
}

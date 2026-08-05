"use client";

import { useActionState, useState } from "react";
import { BadgeCheck, Globe, MapPin, PenLine, Star, UserRound } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { NoticePanel } from "@/shared/components/account/AccountUI";
import {
  DashboardDetailCard,
  DashboardStagger,
  GlassCard,
  PremiumButton,
  SecondaryButton,
  StatusBadge,
  dashboardInputClass,
} from "@/shared/components/admin/DashboardUI";
import AccountPageHeader from "@/features/account/components/AccountPageHeader";
import type { ApplicantProfileField } from "@/features/account/schemas/applicant-profile.schema";
import { updateApplicantProfileAction } from "@/features/account/server/profile.actions";

export type ApplicantProfileValues = Record<ApplicantProfileField, string>;

type FieldDef = {
  name: ApplicantProfileField;
  label: string;
  required?: boolean;
  type?: "text" | "tel" | "url";
  inputMode?: "numeric";
  autoComplete?: string;
};

function ProfileLinkValue({ href, notSet }: { href: string; notSet: string }) {
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

/**
 * Applicant profile: read-only by default, switching in place to an editable
 * form for the fields the applicant owns. Membership and sign-in email stay
 * read-only — those are verified and changed by staff.
 */
export default function ApplicantProfileContent({
  email,
  values,
  membershipNumber,
  membershipLevel,
  membershipVerifiedLabel,
  isVerifiedMember,
}: {
  email: string;
  values: ApplicantProfileValues;
  membershipNumber: string;
  membershipLevel: string;
  membershipVerifiedLabel: string;
  isVerifiedMember: boolean;
}) {
  const { t } = useLanguage();
  const pr = t.account.profile;
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState(updateApplicantProfileAction, undefined);
  const [settledState, setSettledState] = useState(state);

  // Close the editor as soon as a save succeeds. Adjusting state during render
  // rather than in an effect keeps this to a single re-render.
  if (state !== settledState) {
    setSettledState(state);
    if (state?.status === "saved") setEditing(false);
  }

  const personalFields: FieldDef[] = [
    { name: "fullName", label: pr.fullName, required: true, autoComplete: "name" },
    { name: "phone", label: pr.phone, type: "tel", autoComplete: "tel" },
    { name: "professionalTitle", label: pr.professionalTitle, autoComplete: "organization-title" },
    { name: "yearsExperience", label: pr.yearsExperience, inputMode: "numeric" },
    { name: "country", label: pr.country, required: true, autoComplete: "country-name" },
    { name: "stateProvince", label: pr.stateProvince, autoComplete: "address-level1" },
    { name: "city", label: pr.city, required: true, autoComplete: "address-level2" },
  ];

  const linkFields: FieldDef[] = [
    { name: "websiteUrl", label: pr.website, type: "url" },
    { name: "socialUrl", label: pr.socialProfile, type: "url" },
    { name: "reviewsUrl", label: pr.reviews, type: "url" },
  ];

  const location = [values.city, values.stateProvince, values.country].filter(Boolean).join(", ");

  function errorText(code: string | undefined) {
    if (!code) return null;
    return pr.errors[code as keyof typeof pr.errors] ?? pr.errors.unknown;
  }

  function renderField(field: FieldDef) {
    const message = errorText(state?.fieldErrors?.[field.name]);
    const errorId = `${field.name}-error`;

    return (
      <div key={field.name} className="min-w-0">
        <label
          htmlFor={field.name}
          className="block text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]"
        >
          {field.label}
          {field.required ? <span aria-hidden className="ml-1 text-[var(--color-blue)]">*</span> : null}
        </label>
        <input
          id={field.name}
          name={field.name}
          type={field.type ?? "text"}
          inputMode={field.inputMode}
          autoComplete={field.autoComplete}
          required={field.required}
          defaultValue={values[field.name]}
          aria-invalid={message ? true : undefined}
          aria-describedby={message ? errorId : undefined}
          className={`${dashboardInputClass} mt-2`}
        />
        {message ? (
          <p id={errorId} className="mt-1.5 text-[0.78rem] text-red-700">
            {message}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <AccountPageHeader
        eyebrow={t.account.nav.brand}
        title={pr.title}
        actions={
          editing ? null : (
            <SecondaryButton onClick={() => setEditing(true)}>
              <PenLine size={15} /> {pr.edit}
            </SecondaryButton>
          )
        }
      />

      {!editing && state?.status === "saved" ? (
        <NoticePanel tone="success" role="status" title={pr.saved} />
      ) : null}

      {state?.formError ? (
        <NoticePanel tone="error" role="alert" title={errorText(state.formError)} />
      ) : null}

      <GlassCard className="p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-blue-wash)] font-[var(--font-title-family)] text-xl text-[var(--color-blue)] shadow-sm sm:size-16 sm:text-2xl">
            {values.fullName.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-[var(--font-title-family)] text-[clamp(1.5rem,3vw,2rem)] font-light leading-tight text-[var(--color-ink)]">
              {values.fullName}
            </h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--color-ink-soft)]">
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <UserRound aria-hidden size={14} className="shrink-0 text-[var(--color-blue)]" />
                <span className="break-all">{email}</span>
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

      {editing ? (
        <form action={formAction} className="flex flex-col gap-5">
          <GlassCard className="p-4 sm:p-5">
            <h2 className="font-[var(--font-title-family)] text-[1.35rem] font-light text-[var(--color-ink)]">
              {pr.personalDetails}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {personalFields.map(renderField)}
            </div>
          </GlassCard>

          <GlassCard className="p-4 sm:p-5">
            <h2 className="inline-flex items-center gap-2 font-[var(--font-title-family)] text-[1.35rem] font-light text-[var(--color-ink)]">
              <Globe aria-hidden size={17} className="text-[var(--color-blue)]" />
              {pr.publicLinks}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {linkFields.map(renderField)}
            </div>
            <p className="mt-4 text-[0.8rem] leading-5 text-[var(--color-ink-soft)]">{pr.linksNote}</p>
          </GlassCard>

          <div className="flex flex-wrap items-center gap-2">
            <PremiumButton type="submit" disabled={pending}>
              {pending ? pr.saving : pr.save}
            </PremiumButton>
            <SecondaryButton onClick={() => setEditing(false)} disabled={pending}>
              {pr.cancel}
            </SecondaryButton>
          </div>
        </form>
      ) : (
        <>
          <DashboardStagger className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {personalFields
              .filter((field) => field.name !== "fullName")
              .map((field) => (
                <DashboardDetailCard
                  key={field.name}
                  label={field.label}
                  value={values[field.name] || pr.notSet}
                />
              ))}
          </DashboardStagger>

          <div className="grid items-start gap-5 xl:grid-cols-2">
            <GlassCard className="p-4 sm:p-5">
              <h2 className="inline-flex items-center gap-2 font-[var(--font-title-family)] text-[1.35rem] font-light text-[var(--color-ink)]">
                <Star aria-hidden size={17} className="text-[var(--color-blue)]" />
                {pr.membership}
              </h2>
              <div className="mt-4 grid gap-3">
                <DashboardDetailCard
                  label={pr.membershipNumber}
                  value={membershipNumber || pr.notSet}
                />
                <DashboardDetailCard
                  label={pr.membershipLevel}
                  value={membershipLevel || pr.notSet}
                />
                <DashboardDetailCard
                  label={pr.verified}
                  value={membershipVerifiedLabel || pr.notVerified}
                />
              </div>
            </GlassCard>

            <GlassCard className="p-4 sm:p-5">
              <h2 className="inline-flex items-center gap-2 font-[var(--font-title-family)] text-[1.35rem] font-light text-[var(--color-ink)]">
                <Globe aria-hidden size={17} className="text-[var(--color-blue)]" />
                {pr.publicLinks}
              </h2>
              <div className="mt-4 grid gap-3">
                {linkFields.map((field) => (
                  <DashboardDetailCard
                    key={field.name}
                    label={field.label}
                    value={<ProfileLinkValue href={values[field.name]} notSet={pr.notSet} />}
                  />
                ))}
              </div>
              <p className="mt-4 text-[0.8rem] leading-5 text-[var(--color-ink-soft)]">{pr.linksNote}</p>
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
}

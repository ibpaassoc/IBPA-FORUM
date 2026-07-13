import JuryScoreForm from "@/features/admin/components/jury-applications/JuryScoreForm";
import type { JuryNominationScoringRecord } from "@/features/admin/server/jury";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  ExternalLink,
  Files,
  Globe,
  Layers3,
  Mail,
  MapPin,
  ReceiptText,
  UserRound,
} from "lucide-react";
import {
  DashboardBadge,
  DashboardCard,
  DashboardChip,
  DashboardDetailCard,
  DashboardPageHeader,
  DashboardPanel,
  DashboardSecondaryBtn,
} from "@/shared/components/admin/DashboardUI";

type SelectedAwardSummary = {
  categoryId: string;
  categoryName: string;
  awardId: string;
  awardName: string;
};

function formatAnswerValue(answer: {
  valueText: string | null;
  valueNumber: number | null;
  valueBoolean: boolean | null;
  valueJson: unknown;
}) {
  if (answer.valueText) return answer.valueText;
  if (answer.valueNumber !== null) return String(answer.valueNumber);
  if (answer.valueBoolean !== null) return answer.valueBoolean ? "Yes" : "No";
  if (Array.isArray(answer.valueJson)) return answer.valueJson.join(", ");
  if (answer.valueJson && typeof answer.valueJson === "object") {
    return JSON.stringify(answer.valueJson, null, 2);
  }
  return "Not provided";
}

function formatLegacyFieldLabel(fieldKey: string) {
  return fieldKey
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replaceAll("_", " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (value) => value.toUpperCase());
}

function parseSelectedAwards(valueJson: unknown): SelectedAwardSummary[] {
  if (!Array.isArray(valueJson)) {
    return [];
  }

  return valueJson.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }

    const record = item as Record<string, unknown>;
    const categoryId = typeof record.categoryId === "string" ? record.categoryId : "";
    const categoryName = typeof record.categoryName === "string" ? record.categoryName : "";
    const awardId = typeof record.awardId === "string" ? record.awardId : "";
    const awardName = typeof record.awardName === "string" ? record.awardName : "";

    if (!categoryId || !categoryName || !awardId || !awardName) {
      return [];
    }

    return [{ categoryId, categoryName, awardId, awardName }];
  });
}

function FileLink({
  href,
  name,
  sizeBytes,
}: {
  href: string;
  name: string;
  sizeBytes: number;
}) {
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

function EmptyInline({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[22px] border border-dashed border-[rgba(37,42,45,0.14)] bg-white/62 px-4 py-4 text-sm text-[var(--color-ink-soft)]">
      {children}
    </div>
  );
}

function SectionLabel({
  icon: Icon,
  children,
}: {
  icon: typeof UserRound;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-[var(--color-blue)]">
      <Icon aria-hidden size={16} />
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">{children}</p>
    </div>
  );
}

export default function JuryApplicationDetailPage({
  nomination,
  categoryFields,
  score,
}: {
  nomination: JuryNominationScoringRecord;
  categoryFields: Array<{ key: string; label: string; type: string }>;
  score: {
    id: string;
    technical: number | null;
    aesthetic: number | null;
    creativity: number | null;
    impact: number | null;
    presentation: number | null;
    totalScore: number | null;
    comment: string | null;
    status: "DRAFT" | "SUBMITTED" | "REOPENED";
    submittedAt: Date | null;
    updatedAt: Date;
  } | null;
}) {
  const { application } = nomination;
  const appAnswerMap = new Map(application.answers.map((answer) => [answer.fieldKey, answer]));
  const selectedAwards = parseSelectedAwards(appAnswerMap.get("selectedAwards")?.valueJson);
  const appFileMap = new Map<string, typeof application.files>();

  for (const file of application.files) {
    const group = appFileMap.get(file.fieldKey) ?? [];
    group.push(file);
    appFileMap.set(file.fieldKey, group);
  }

  const nomAnswerMap = new Map(nomination.answers.map((answer) => [answer.fieldKey, answer]));
  const nomFileMap = new Map<string, typeof nomination.files>();

  for (const file of nomination.files) {
    const group = nomFileMap.get(file.fieldKey) ?? [];
    group.push(file);
    nomFileMap.set(file.fieldKey, group);
  }

  const nominationOrder = new Map(selectedAwards.map((item, index) => [item.awardId, index]));
  const orderedApplicationNominations = [...application.nominationApplications].sort((left, right) => {
    const leftOrder = nominationOrder.get(left.awardId) ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = nominationOrder.get(right.awardId) ?? Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.createdAt.getTime() - right.createdAt.getTime();
  });

  const categoryFieldKeySet = new Set(categoryFields.map((field) => field.key));
  const categoryFileKeySet = new Set(
    categoryFields.filter((field) => field.type === "file").map((field) => field.key)
  );

  const hasNominationAnswers = nomination.answers.length > 0 || nomination.files.length > 0;
  const legacyAppAnswers = !hasNominationAnswers
    ? application.answers.filter(
        (answer) =>
          answer.fieldKey !== "heardAboutOther" &&
          answer.fieldKey !== "licenseCertification" &&
          answer.fieldKey !== "selectedAwards" &&
          categoryFieldKeySet.has(answer.fieldKey)
      )
    : [];
  const legacyAppFileEntries = !hasNominationAnswers
    ? [...appFileMap.entries()].filter(([key]) => categoryFileKeySet.has(key))
    : [];

  const nominationFileFields = categoryFields.filter((field) => field.type === "file");
  const nominationTextFields = categoryFields.filter((field) => field.type !== "file");
  const hasVisibleAnswers = hasNominationAnswers
    ? nominationTextFields.some((field) => nomAnswerMap.get(field.key))
    : legacyAppAnswers.length > 0;
  const currentIndex = orderedApplicationNominations.findIndex((item) => item.id === nomination.id);
  const licenseFiles = appFileMap.get("licenseCertification") ?? [];

  return (
    <div className="flex flex-col gap-5">
      <DashboardPageHeader
        label="Nomination review"
        title={nomination.award.name}
        description={`${nomination.category.name} / ${application.fullName}`}
        actions={
          <DashboardSecondaryBtn href="/account/jury">
            <ArrowLeft aria-hidden size={15} />
            Back
          </DashboardSecondaryBtn>
        }
      />

      <DashboardCard>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <DashboardChip>{nomination.category.name}</DashboardChip>
            <DashboardBadge tone="blue">
              {currentIndex + 1} of {orderedApplicationNominations.length}
            </DashboardBadge>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-[var(--color-ink-soft)]">
            <span className="inline-flex items-center gap-2 rounded-[18px] border border-[rgba(37,42,45,0.08)] bg-white/62 px-2.5 py-1">
              <Mail aria-hidden size={13} />
              {application.email}
            </span>
            <span className="inline-flex items-center gap-2 rounded-[18px] border border-[rgba(37,42,45,0.08)] bg-white/62 px-2.5 py-1">
              <MapPin aria-hidden size={13} />
              {application.city}, {application.country}
            </span>
          </div>
        </div>
      </DashboardCard>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col gap-5">
          <DashboardCard className="p-0">
            <div className="border-b border-[rgba(37,42,45,0.08)] p-4 md:p-5">
              <h2 className="font-[var(--font-title-family)] text-2xl font-light tracking-[-0.025em] text-[var(--color-ink)]">
                Applicant context
              </h2>
            </div>

            <div className="flex flex-col gap-6 p-4 md:p-5">
              <div>
                <SectionLabel icon={BriefcaseBusiness}>Details</SectionLabel>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <DashboardDetailCard label="Full legal name" value={application.fullName} />
                  <DashboardDetailCard label="Professional title" value={application.professionalTitle} />
                  <DashboardDetailCard label="Email address" value={application.email} />
                  <DashboardDetailCard label="Phone / WhatsApp" value={application.phone} />
                  <DashboardDetailCard label="Country / City" value={`${application.country}, ${application.city}`} />
                  <DashboardDetailCard label="State / Province" value={application.stateProvince || "Not required"} />
                  <DashboardDetailCard label="Years of experience" value={String(application.yearsExperience)} />
                  <DashboardDetailCard label="Membership level" value={application.membershipLevel || "Not available"} />
                </div>
              </div>

              <div>
                <SectionLabel icon={Globe}>Public presence</SectionLabel>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <DashboardDetailCard label="Instagram" value={application.websiteUrl || "Not provided"} />
                  <DashboardDetailCard label="Social media" value={application.socialUrl || "Not provided"} />
                  <DashboardDetailCard label="Client reviews" value={application.reviewsUrl || "Not provided"} />
                  <DashboardDetailCard
                    label="Heard about us"
                    value={
                      appAnswerMap.get("heardAboutOther")?.valueText
                        ? `${application.heardAbout || "Other"}: ${appAnswerMap.get("heardAboutOther")?.valueText}`
                        : application.heardAbout || "Not provided"
                    }
                  />
                </div>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard className="p-0">
            <div className="border-b border-[rgba(37,42,45,0.08)] p-4 md:p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-blue)]">
                Evidence
              </p>
              <h2 className="mt-1 font-[var(--font-title-family)] text-2xl font-light tracking-[-0.025em] text-[var(--color-ink)]">
                {nomination.award.name}
              </h2>
            </div>

            <div className="grid gap-4 p-4 md:p-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                  Answers
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {hasNominationAnswers
                    ? nominationTextFields.map((field) => {
                        const answer = nomAnswerMap.get(field.key);
                        if (!answer) return null;
                        return (
                          <DashboardDetailCard
                            key={field.key}
                            label={field.label}
                            value={formatAnswerValue(answer)}
                          />
                        );
                      })
                    : legacyAppAnswers.map((answer) => (
                        <DashboardDetailCard
                          key={answer.id}
                          label={formatLegacyFieldLabel(answer.fieldKey)}
                          value={formatAnswerValue(answer)}
                        />
                      ))}
                </div>
                {!hasVisibleAnswers ? (
                  <div className="mt-3">
                    <EmptyInline>No text answers were saved for this nomination.</EmptyInline>
                  </div>
                ) : null}
              </div>

              <DashboardPanel>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                  Files
                </p>
                <div className="mt-3 flex flex-col gap-4">
                  {hasNominationAnswers
                    ? nominationFileFields.map((field) => {
                        const files = nomFileMap.get(field.key) ?? [];
                        return (
                          <div key={field.key}>
                            <p className="text-sm font-medium text-[var(--color-ink)]">{field.label}</p>
                            <div className="mt-2 flex flex-col gap-2">
                              {files.map((file) => (
                                <FileLink
                                  key={file.id}
                                  href={`/api/jury/nomination-files/${file.id}`}
                                  name={file.fileName}
                                  sizeBytes={file.fileSize}
                                />
                              ))}
                              {files.length === 0 ? <EmptyInline>No files uploaded.</EmptyInline> : null}
                            </div>
                          </div>
                        );
                      })
                    : legacyAppFileEntries.map(([key, files]) => (
                        <div key={key}>
                          <p className="text-sm font-medium text-[var(--color-ink)]">
                            {formatLegacyFieldLabel(key)}
                          </p>
                          <div className="mt-2 flex flex-col gap-2">
                            {files.map((file) => (
                              <FileLink
                                key={file.id}
                                href={`/api/jury/application-files/${file.id}`}
                                name={file.fileName}
                                sizeBytes={file.fileSize}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                </div>
              </DashboardPanel>
            </div>
          </DashboardCard>
        </div>

        <aside className="order-first flex flex-col gap-4 xl:order-none xl:sticky xl:top-5 xl:self-start">
          <JuryScoreForm nominationApplicationId={nomination.id} initialScore={score} />

          <DashboardCard>
            <div className="flex items-center gap-2 text-[var(--color-blue)]">
              <Layers3 aria-hidden size={16} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Application map</p>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {orderedApplicationNominations.map((item, index) => {
                const active = item.id === nomination.id;

                return (
                  <div
                    key={item.id}
                    className={`rounded-[22px] border px-3 py-3 ${
                      active ? "border-[rgba(114,160,193,0.34)] bg-[var(--color-blue-wash)]" : "border-[rgba(37,42,45,0.08)] bg-white"
                    }`}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
                      Nomination {String(index + 1).padStart(2, "0")}
                    </p>
                    <p className="mt-1 text-sm font-medium text-[var(--color-ink)]">{item.award.name}</p>
                    <p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">{item.category.name}</p>
                    {active ? (
                      <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-blue)]">
                        Current
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </DashboardCard>

          <DashboardCard>
            <div className="flex items-center gap-2 text-[var(--color-blue)]">
              <ReceiptText aria-hidden size={16} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Shared credentials</p>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-[var(--color-ink)]">
                Professional license / Certification
              </p>
              <div className="mt-2 flex flex-col gap-2">
                {licenseFiles.map((file) => (
                  <FileLink
                    key={file.id}
                    href={`/api/jury/application-files/${file.id}`}
                    name={file.fileName}
                    sizeBytes={file.fileSize}
                  />
                ))}
                {licenseFiles.length === 0 ? <EmptyInline>No license file uploaded.</EmptyInline> : null}
              </div>
            </div>
          </DashboardCard>
        </aside>
      </div>
    </div>
  );
}

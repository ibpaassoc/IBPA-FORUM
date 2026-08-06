import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight, ChevronRight, ExternalLink, Globe2 } from "lucide-react";
import type { JuryNominationReviewRecord } from "@/features/jury/server/reviews";
import JuryReviewWorkspace from "@/features/account/components/jury/JuryReviewWorkspace";
import type { JuryReviewValue } from "@/features/account/components/jury/JuryReviewScorecard";
import { isFinalReviewStatus } from "@/features/account/components/jury/jury-presentation";
import type { NominationScoringDefinition } from "@/features/jury/scoring/category-scoring";
import { getServerTranslations } from "@/lib/i18n/server";
import type { Translations } from "@/lib/i18n/translations";
import FilePreviewGallery from "@/shared/components/files/FilePreviewGallery";

const LONG_ANSWER_TYPES = new Set(["textarea"]);

/** Uploads on this field are ordered before/after couples. */
const BEFORE_AFTER_FIELD_KEY = "beforeAfterPhotos";

function formatAnswerValue(
  answer: {
    valueText: string | null;
    valueNumber: number | null;
    valueBoolean: boolean | null;
    valueJson: unknown;
  },
  labels: Translations["account"]["jury"]["review"],
) {
  if (answer.valueText) return answer.valueText;
  if (answer.valueNumber !== null) return String(answer.valueNumber);
  if (answer.valueBoolean !== null) return answer.valueBoolean ? labels.yes : labels.no;
  if (Array.isArray(answer.valueJson)) return answer.valueJson.join(", ");
  if (answer.valueJson && typeof answer.valueJson === "object") {
    return JSON.stringify(answer.valueJson, null, 2);
  }
  return labels.notProvided;
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-[rgba(37,42,45,0.08)] bg-white/72 shadow-[0_20px_62px_rgba(37,42,45,0.06)] backdrop-blur-xl">
      <div className="border-b border-[rgba(37,42,45,0.08)] px-5 py-4">
        <h2 className="font-[var(--font-title-family)] text-xl font-light tracking-[-0.02em] text-[var(--color-ink)]">
          {title}
        </h2>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function EmptyValue({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[20px] border border-dashed border-[rgba(37,42,45,0.14)] bg-white/58 px-4 py-4 text-sm text-[var(--color-ink-soft)]">
      {children}
    </div>
  );
}

const fieldLabelClass =
  "text-[0.6rem] font-semibold uppercase tracking-[0.13em] text-[var(--color-ink-soft)]";

export default async function JuryNominationReviewPage({
  nomination,
  categoryFields,
  scoringDefinition,
  review,
}: {
  nomination: JuryNominationReviewRecord;
  categoryFields: Array<{ key: string; label: string; type: string; description?: string }>;
  scoringDefinition: NominationScoringDefinition;
  review: JuryReviewValue | null;
}) {
  const t = await getServerTranslations();
  const labels = t.account.jury.review;
  const answerMap = new Map(nomination.answers.map((answer) => [answer.fieldKey, answer]));
  const filesByField = new Map<string, typeof nomination.files>();
  for (const file of nomination.files) {
    const group = filesByField.get(file.fieldKey) ?? [];
    group.push(file);
    filesByField.set(file.fieldKey, group);
  }
  const answerFields = categoryFields.filter((field) => field.type !== "file");
  const fileFields = categoryFields.filter((field) => field.type === "file");
  const answeredFields = answerFields.filter((field) => answerMap.has(field.key));
  const scoredCount = scoringDefinition.criteria.filter(
    (criterion) => typeof review?.scores[criterion.key] === "number",
  ).length;
  const reviewProgress =
    scoringDefinition.criteria.length === 0
      ? 100
      : Math.round((scoredCount / scoringDefinition.criteria.length) * 100);
  const statusLabel = t.account.jury.statuses[review?.status ?? "NOT_STARTED"];

  const header = (
    <header className="rounded-[28px] border border-[rgba(114,160,193,0.2)] bg-white/78 p-4 shadow-[0_20px_60px_rgba(37,42,45,0.07)] backdrop-blur-2xl sm:p-5">
      <Link
        href="/account/jury/nominations"
        className="inline-flex min-h-10 items-center gap-2 rounded-full px-2 text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-blue)] transition hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)]"
      >
        <ArrowLeft aria-hidden size={14} />
        {labels.back}
      </Link>
      <div className="mt-2 flex flex-wrap gap-2">
        <span className="rounded-full border border-[rgba(114,160,193,0.2)] bg-[var(--color-blue-wash)] px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[#356f98]">
          {nomination.category.name}
        </span>
        <span className="rounded-full border border-[rgba(37,42,45,0.1)] bg-white/82 px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink-soft)]">
          {statusLabel}
        </span>
      </div>
      <h1 className="mt-2.5 font-[var(--font-title-family)] text-[clamp(1.8rem,4vw,2.9rem)] font-light leading-[1.06] tracking-[-0.03em] text-[var(--color-ink)]">
        {nomination.award.name}
      </h1>
      <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.85rem] text-[var(--color-ink-soft)]">
        <span className="text-[var(--color-ink)]">{nomination.applicant.fullName}</span>
        <span aria-hidden className="size-1 rounded-full bg-[rgba(37,42,45,0.24)]" />
        <span className="text-[var(--color-blue)]">
          {reviewProgress}% {labels.reviewedSuffix}
        </span>
      </p>
    </header>
  );

  const submission = (
    <SectionCard title={labels.responsesTitle}>
      {answeredFields.length === 0 ? (
        <EmptyValue>{labels.noResponses}</EmptyValue>
      ) : (
        <div className="grid gap-2.5">
          {answeredFields.map((field) => {
            const answer = answerMap.get(field.key)!;
            const value = formatAnswerValue(answer, labels);
            const isUrl = field.type === "url" && /^https?:\/\//i.test(value);

            if (isUrl) {
              return (
                <a
                  key={field.key}
                  href={value}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-w-0 items-center justify-between gap-3 rounded-[20px] border border-[rgba(37,42,45,0.08)] bg-white/78 px-4 py-3.5 transition hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)]"
                >
                  <span className="min-w-0">
                    <span className={`block ${fieldLabelClass}`}>{field.label}</span>
                    <span className="mt-1 block truncate text-sm font-medium text-[var(--color-blue)]">
                      {labels.openLink}
                    </span>
                  </span>
                  <ExternalLink aria-hidden size={15} className="shrink-0 text-[var(--color-blue)]" />
                </a>
              );
            }

            if (LONG_ANSWER_TYPES.has(field.type)) {
              return (
                <details
                  key={field.key}
                  className="group min-w-0 rounded-[20px] border border-[rgba(37,42,45,0.08)] bg-white/78 px-4 py-3.5 open:bg-white/90"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)] [&::-webkit-details-marker]:hidden">
                    <span className="min-w-0">
                      <span className={`block ${fieldLabelClass}`}>{field.label}</span>
                      <span className="mt-1 block truncate text-sm text-[var(--color-ink)] group-open:hidden">
                        {value}
                      </span>
                    </span>
                    <ChevronRight
                      aria-hidden
                      size={16}
                      className="shrink-0 text-[var(--color-ink-soft)] transition group-open:rotate-90 motion-reduce:transition-none"
                    />
                  </summary>
                  <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-[1.7] text-[var(--color-ink)]">
                    {value}
                  </p>
                </details>
              );
            }

            return (
              <div
                key={field.key}
                className="min-w-0 rounded-[20px] border border-[rgba(37,42,45,0.08)] bg-white/78 px-4 py-3.5"
              >
                <p className={fieldLabelClass}>{field.label}</p>
                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-[1.7] text-[var(--color-ink)]">
                  {value}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );

  const files = (
    <SectionCard title={labels.filesTitle}>
      {fileFields.length === 0 ? (
        <EmptyValue>{labels.noFileRequirements}</EmptyValue>
      ) : (
        <div className="grid gap-5">
          {fileFields.map((field) => {
            const group = filesByField.get(field.key) ?? [];
            return (
              <div key={field.key} className="min-w-0">
                <p className={fieldLabelClass}>{field.label}</p>
                <div className="mt-2.5">
                  {group.length === 0 ? (
                    <EmptyValue>{labels.noFiles}</EmptyValue>
                  ) : (
                    <FilePreviewGallery
                      items={group.map((file) => ({
                        id: file.id,
                        name: file.displayFileName || file.fileName,
                        size: file.fileSize,
                        mimeType: file.mimeType,
                        source: `/api/account/jury/nomination-files/${file.id}`,
                      }))}
                      groupLabel={field.label}
                      pairing={
                        field.key === BEFORE_AFTER_FIELD_KEY ? "before-after" : undefined
                      }
                    />
                  )}
                </div>
              </div>
            );
          })}

          {nomination.applicant.website ? (
            <a
              href={nomination.applicant.website}
              target="_blank"
              rel="noreferrer"
              className="flex min-w-0 items-center justify-between gap-3 rounded-[20px] border border-[rgba(114,160,193,0.2)] bg-[var(--color-blue-wash)] px-4 py-3.5 transition hover:border-[var(--color-blue)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)]"
            >
              <span className="flex min-w-0 items-center gap-3">
                <Globe2 aria-hidden size={17} className="shrink-0 text-[var(--color-blue)]" />
                <span className="min-w-0">
                  <span className={`block ${fieldLabelClass}`}>{labels.professionalLink}</span>
                  <span className="mt-1 block truncate text-sm font-medium text-[var(--color-ink)]">
                    {nomination.applicant.website}
                  </span>
                </span>
              </span>
              <ExternalLink aria-hidden size={15} className="shrink-0 text-[var(--color-blue)]" />
            </a>
          ) : null}
        </div>
      )}
    </SectionCard>
  );

  const peers =
    nomination.peerNominations.length > 1 ? (
      <section className="rounded-[24px] border border-[rgba(37,42,45,0.08)] bg-white/76 p-4 shadow-[0_18px_55px_rgba(37,42,45,0.055)] backdrop-blur-xl">
        <h2 className={fieldLabelClass}>{labels.otherNominations}</h2>
        <div className="mt-2.5 grid gap-1.5">
          {nomination.peerNominations.map((peer) => {
            const active = peer.id === nomination.id;
            const done = isFinalReviewStatus(peer.reviewStatus);
            return active ? (
              <div
                key={peer.id}
                className="rounded-[18px] border border-[rgba(114,160,193,0.28)] bg-[var(--color-blue-wash)] px-3.5 py-2.5"
              >
                <p className="truncate text-[0.86rem] font-medium text-[var(--color-ink)]">
                  {peer.award.name}
                </p>
                <p className="text-[0.7rem] text-[var(--color-ink-soft)]">
                  {labels.currentNomination}
                </p>
              </div>
            ) : (
              <Link
                key={peer.id}
                href={`/account/jury/nominations/${peer.id}`}
                className="group flex items-center gap-3 rounded-[18px] border border-[rgba(37,42,45,0.08)] bg-white/76 px-3.5 py-2.5 transition hover:border-[rgba(114,160,193,0.35)] hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)]"
              >
                <span
                  aria-hidden
                  className={`size-2 shrink-0 rounded-full ${done ? "bg-emerald-500" : peer.reviewStatus === "IN_PROGRESS" ? "bg-amber-400" : "bg-[rgba(37,42,45,0.24)]"}`}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.86rem] font-medium text-[var(--color-ink)]">
                    {peer.award.name}
                  </span>
                  <span className="text-[0.7rem] text-[var(--color-ink-soft)]">
                    {t.account.jury.statuses[peer.reviewStatus]}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden
                  size={14}
                  className="shrink-0 text-[var(--color-blue)] transition group-hover:translate-x-0.5 motion-reduce:transition-none"
                />
              </Link>
            );
          })}
        </div>
      </section>
    ) : undefined;

  return (
    <JuryReviewWorkspace
      nominationId={nomination.id}
      scoringDefinition={scoringDefinition}
      review={review}
      header={header}
      submission={submission}
      files={files}
      peers={peers}
    />
  );
}

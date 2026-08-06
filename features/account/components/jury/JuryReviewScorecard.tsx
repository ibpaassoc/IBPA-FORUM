"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState, useTransition } from "react";
import clsx from "clsx";
import { Minus, Plus, Save, ShieldCheck } from "lucide-react";
import { NoticePanel } from "@/shared/components/account/AccountUI";
import { ConfirmDialog } from "@/shared/components/admin/DashboardUI";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type {
  NominationScoringDefinition,
  ScoringCriterion,
} from "@/features/jury/scoring/category-scoring";

type ReviewStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "LOCKED";
type ScoreValue = "" | `${number}`;

export type JuryReviewValue = {
  id: string;
  scores: Record<string, number | null>;
  totalScore: number | null;
  comment: string | null;
  status: ReviewStatus;
  completedAt: Date | null;
  updatedAt: Date;
};

function toValue(value: number | null | undefined): ScoreValue {
  return typeof value === "number" ? `${value}` : "";
}

function parseScore(value: ScoreValue) {
  return value === "" ? null : Number(value);
}

function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export type JuryScoring = ReturnType<typeof useJuryScoring>;

/**
 * Single source of truth for a jury review: the per-criterion scores, the
 * derived total and completion counts, and the draft/submit calls. The
 * desktop panel and the mobile scoring sheet both render from this one state
 * so a score entered in either surface is immediately reflected in the other.
 */
export function useJuryScoring({
  nominationId,
  scoringDefinition,
  initialReview,
}: {
  nominationId: string;
  scoringDefinition: NominationScoringDefinition;
  initialReview: JuryReviewValue | null;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const copy = t.account.jury.scorecard;
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<ReviewStatus>(initialReview?.status ?? "NOT_STARTED");
  const [values, setValues] = useState<Record<string, ScoreValue>>(() =>
    Object.fromEntries(
      scoringDefinition.criteria.map((criterion) => [
        criterion.key,
        toValue(initialReview?.scores[criterion.key]),
      ]),
    ),
  );
  const [comment, setComment] = useState(initialReview?.comment ?? "");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isComplete = status === "COMPLETED" || status === "LOCKED";
  const presentScoreCount = scoringDefinition.criteria.filter(
    (criterion) => values[criterion.key] !== "",
  ).length;
  const total = scoringDefinition.criteria.reduce<number>(
    (sum, criterion) => sum + (parseScore(values[criterion.key] ?? "") ?? 0),
    0,
  );
  const progress =
    scoringDefinition.criteria.length === 0
      ? 100
      : Math.round((presentScoreCount / scoringDefinition.criteria.length) * 100);
  const canSubmit = presentScoreCount === scoringDefinition.criteria.length;
  const busy = isPending || isSaving;

  const setScore = useCallback(
    (key: string, next: number | "") => {
      if (next === "") {
        setValues((current) => ({ ...current, [key]: "" }));
        return;
      }
      const maxScore =
        scoringDefinition.criteria.find((criterion) => criterion.key === key)?.maxScore ?? 0;
      // Every entry point (input, buttons, slider) clamps to the criterion's
      // own range, so an out-of-range value can never reach the server.
      const safe = Math.max(0, Math.min(maxScore, Math.round(next)));
      setValues((current) => ({ ...current, [key]: `${safe}` as ScoreValue }));
    },
    [scoringDefinition.criteria],
  );

  const sendReview = useCallback(
    async (mode: "draft" | "submit") => {
      setError(null);
      setNotice(null);

      if (mode === "submit" && presentScoreCount !== scoringDefinition.criteria.length) {
        setError(copy.incompleteError);
        return;
      }

      setIsSaving(true);
      let response: Response;
      try {
        response = await fetch(`/api/account/jury/nominations/${nominationId}/${mode}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scores: Object.fromEntries(
              scoringDefinition.criteria.map((criterion) => [
                criterion.key,
                parseScore(values[criterion.key] ?? ""),
              ]),
            ),
            comment,
          }),
        });
      } catch {
        setIsSaving(false);
        setError(copy.saveError);
        return;
      }

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; status?: ReviewStatus }
        | null;
      setIsSaving(false);

      if (!response.ok) {
        setError(payload?.message ?? copy.saveError);
        return;
      }

      setStatus(payload?.status ?? (mode === "submit" ? "COMPLETED" : "IN_PROGRESS"));
      setNotice(mode === "draft" ? copy.draftSaved : copy.submittedNotice);
      startTransition(() => router.refresh());
    },
    [
      comment,
      copy.draftSaved,
      copy.incompleteError,
      copy.saveError,
      copy.submittedNotice,
      nominationId,
      presentScoreCount,
      router,
      scoringDefinition.criteria,
      values,
    ],
  );

  return useMemo(
    () => ({
      criteria: scoringDefinition.criteria,
      maximumTotal: scoringDefinition.maximumTotal,
      values,
      comment,
      setComment,
      setScore,
      scoreOf: (key: string) => parseScore(values[key] ?? ""),
      total,
      presentScoreCount,
      progress,
      canSubmit,
      isComplete,
      busy,
      error,
      notice,
      confirmOpen,
      openConfirm: () => setConfirmOpen(true),
      closeConfirm: () => setConfirmOpen(false),
      saveDraft: () => void sendReview("draft"),
      submit: () => {
        setConfirmOpen(false);
        void sendReview("submit");
      },
    }),
    [
      busy,
      canSubmit,
      comment,
      confirmOpen,
      error,
      isComplete,
      notice,
      presentScoreCount,
      progress,
      scoringDefinition.criteria,
      scoringDefinition.maximumTotal,
      sendReview,
      setScore,
      total,
      values,
    ],
  );
}

/** Minus / number / plus cluster plus a range slider for one criterion. */
export function JuryScoreControl({
  criterion,
  scoring,
  size = "compact",
}: {
  criterion: ScoringCriterion;
  scoring: JuryScoring;
  size?: "compact" | "large";
}) {
  const { t } = useLanguage();
  const copy = t.account.jury.scorecard;
  const value = scoring.scoreOf(criterion.key);
  const disabled = scoring.isComplete || scoring.busy;
  const large = size === "large";
  const buttonSize = large ? "size-14" : "size-9";

  return (
    <div className={clsx("min-w-0", large && "flex flex-col items-center gap-5")}>
      <div className={clsx("flex items-center gap-2", large && "gap-6")}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => scoring.setScore(criterion.key, (value ?? 0) - 1)}
          aria-label={fill(copy.decrease, { label: criterion.label })}
          className={clsx(
            "flex shrink-0 items-center justify-center rounded-full border border-[rgba(114,160,193,0.24)] bg-white/90 text-[var(--color-blue)] transition hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.3)] disabled:cursor-not-allowed disabled:opacity-40",
            buttonSize,
          )}
        >
          <Minus aria-hidden size={large ? 20 : 14} />
        </button>
        <input
          id={`score-${criterion.key}`}
          type="number"
          min={0}
          max={criterion.maxScore}
          step={1}
          inputMode="numeric"
          value={scoring.values[criterion.key] ?? ""}
          disabled={disabled}
          onChange={(event) =>
            scoring.setScore(
              criterion.key,
              event.target.value === "" ? "" : Number(event.target.value),
            )
          }
          aria-label={fill(copy.scoreInput, { label: criterion.label, max: criterion.maxScore })}
          className={clsx(
            "border-0 bg-transparent text-center font-[var(--font-title-family)] font-light text-[var(--color-ink)] outline-none focus-visible:rounded-[14px] focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.3)] disabled:cursor-not-allowed",
            large ? "h-14 w-24 text-[2.75rem]" : "h-9 w-14 text-[1.6rem]",
          )}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => scoring.setScore(criterion.key, (value ?? 0) + 1)}
          aria-label={fill(copy.increase, { label: criterion.label })}
          className={clsx(
            "flex shrink-0 items-center justify-center rounded-full border border-[rgba(114,160,193,0.24)] bg-[var(--color-blue-wash)] text-[var(--color-blue)] transition hover:bg-[var(--color-blue-light)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.3)] disabled:cursor-not-allowed disabled:opacity-40",
            buttonSize,
          )}
        >
          <Plus aria-hidden size={large ? 20 : 14} />
        </button>
      </div>

      <input
        type="range"
        min={0}
        max={criterion.maxScore}
        step={1}
        value={value ?? 0}
        disabled={disabled}
        onChange={(event) => scoring.setScore(criterion.key, Number(event.target.value))}
        aria-label={fill(copy.scoreInput, { label: criterion.label, max: criterion.maxScore })}
        className={clsx("jury-score-slider w-full", large ? "mt-1" : "mt-3")}
      />
    </div>
  );
}

/** Total, scored count, and progress bar — shared by the panel and the dock. */
export function JuryScoreTotals({ scoring }: { scoring: JuryScoring }) {
  const { t } = useLanguage();
  const copy = t.account.jury.scorecard;

  return (
    <div className="text-right">
      <p className="font-[var(--font-title-family)] text-[2rem] font-light leading-none text-[var(--color-ink)]">
        {scoring.total}
        <span className="text-[0.5em] text-[var(--color-ink-soft)]"> / {scoring.maximumTotal}</span>
      </p>
      <p className="mt-1 text-[0.62rem] text-[var(--color-ink-soft)]">
        {scoring.presentScoreCount} {copy.scoredOf} {scoring.criteria.length} {copy.scored}
      </p>
    </div>
  );
}

export function JuryScoreProgressBar({ scoring }: { scoring: JuryScoring }) {
  const { t } = useLanguage();

  return (
    <div
      role="progressbar"
      aria-valuenow={scoring.progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${t.account.jury.scorecard.title}: ${scoring.progress}%`}
      className="h-2 overflow-hidden rounded-full bg-[rgba(114,160,193,0.14)]"
    >
      <div
        className="h-full rounded-full bg-[var(--color-blue)] transition-[width] duration-300 motion-reduce:transition-none"
        style={{ width: `${scoring.progress}%` }}
      />
    </div>
  );
}

/** Save draft + submit pair, reused by the panel and the mobile sheet. */
export function JuryScoreActions({ scoring }: { scoring: JuryScoring }) {
  const { t } = useLanguage();
  const copy = t.account.jury.scorecard;

  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        disabled={scoring.busy}
        onClick={scoring.saveDraft}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[rgba(114,160,193,0.28)] bg-white/82 px-4 text-[0.7rem] font-semibold uppercase tracking-[0.11em] text-[var(--color-ink)] transition hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.3)] disabled:cursor-wait disabled:opacity-55"
      >
        <Save aria-hidden size={15} />
        {copy.saveDraft}
      </button>
      <button
        type="button"
        disabled={scoring.busy || !scoring.canSubmit}
        onClick={scoring.openConfirm}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--color-blue)] px-4 text-[0.7rem] font-semibold uppercase tracking-[0.11em] text-white shadow-[0_14px_30px_rgba(114,160,193,0.24)] transition hover:bg-[#5f91b6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.35)] disabled:cursor-not-allowed disabled:opacity-45"
      >
        <ShieldCheck aria-hidden size={15} />
        {copy.submit}
      </button>
    </div>
  );
}

/** Confirmation gate in front of the irreversible final submission. */
export function JurySubmitConfirm({ scoring }: { scoring: JuryScoring }) {
  const { t } = useLanguage();
  const copy = t.account.jury.scorecard;

  return (
    <ConfirmDialog
      open={scoring.confirmOpen}
      title={copy.confirmTitle}
      description={copy.confirmText}
      confirmLabel={copy.confirmSubmit}
      cancelLabel={copy.cancel}
      onConfirm={scoring.submit}
      onCancel={scoring.closeConfirm}
    />
  );
}

export function JuryScoreFeedback({ scoring }: { scoring: JuryScoring }) {
  const { t } = useLanguage();
  const copy = t.account.jury.scorecard;

  return (
    <>
      {scoring.isComplete ? (
        <NoticePanel tone="success" title={copy.completeTitle}>
          {copy.completeText}
        </NoticePanel>
      ) : null}
      {scoring.error ? (
        <NoticePanel tone="error" role="alert">
          {scoring.error}
        </NoticePanel>
      ) : null}
      {scoring.notice ? (
        <NoticePanel tone="success" role="status">
          {scoring.notice}
        </NoticePanel>
      ) : null}
    </>
  );
}

/**
 * Desktop scorecard: a sticky panel with every criterion expanded in a
 * scrollable body and the actions pinned underneath.
 */
export default function JuryReviewScorecard({ scoring }: { scoring: JuryScoring }) {
  const { t } = useLanguage();
  const copy = t.account.jury.scorecard;

  return (
    <section
      id="jury-review-scorecard"
      aria-labelledby="scorecard-heading"
      className="flex max-h-[calc(100vh-3rem)] scroll-mt-3 flex-col overflow-hidden rounded-[28px] border border-[rgba(114,160,193,0.2)] bg-white/82 shadow-[0_26px_80px_rgba(37,42,45,0.09)] backdrop-blur-2xl"
    >
      <div className="shrink-0 border-b border-[rgba(37,42,45,0.08)] p-5">
        <div className="flex items-start justify-between gap-4">
          <h2
            id="scorecard-heading"
            className="font-[var(--font-title-family)] text-2xl font-light tracking-[-0.025em] text-[var(--color-ink)]"
          >
            {copy.title}
          </h2>
          <JuryScoreTotals scoring={scoring} />
        </div>
        <div className="mt-4">
          <JuryScoreProgressBar scoring={scoring} />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-4">
        <JuryScoreFeedback scoring={scoring} />

        {scoring.criteria.map((criterion) => (
          <div
            key={criterion.key}
            className="rounded-[22px] border border-[rgba(37,42,45,0.08)] bg-white/68 p-3.5"
          >
            <div className="flex items-start justify-between gap-3">
              <label htmlFor={`score-${criterion.key}`} className="min-w-0">
                <span className="block text-[0.95rem] font-medium leading-snug text-[var(--color-ink)]">
                  {criterion.label}
                </span>
                <span className="mt-1 block text-[0.74rem] leading-5 text-[var(--color-ink-soft)]">
                  {criterion.description}
                </span>
                <span className="mt-1.5 block text-[0.58rem] font-semibold uppercase tracking-[0.11em] text-[var(--color-blue)]">
                  0–{criterion.maxScore} {copy.pointsRange}
                </span>
              </label>
              <div className="shrink-0">
                <JuryScoreControl criterion={criterion} scoring={scoring} />
              </div>
            </div>
          </div>
        ))}

        <label
          htmlFor="jury-comment"
          className="rounded-[22px] border border-[rgba(37,42,45,0.08)] bg-white/68 p-3.5"
        >
          <span className="text-[0.95rem] font-medium text-[var(--color-ink)]">
            {copy.note}{" "}
            <span className="text-xs font-normal text-[var(--color-ink-soft)]">
              ({copy.optional})
            </span>
          </span>
          <textarea
            id="jury-comment"
            value={scoring.comment}
            disabled={scoring.isComplete || scoring.busy}
            onChange={(event) => scoring.setComment(event.target.value)}
            rows={3}
            maxLength={5000}
            placeholder={copy.notePlaceholder}
            className="mt-2.5 w-full resize-y rounded-[16px] border border-[rgba(114,160,193,0.2)] bg-white/82 px-3.5 py-2.5 text-sm leading-6 text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-ink-muted)] focus:border-[var(--color-blue)] focus:ring-4 focus:ring-[rgba(114,160,193,0.16)] disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>
      </div>

      {scoring.isComplete ? null : (
        <div className="shrink-0 border-t border-[rgba(37,42,45,0.08)] bg-white/60 p-4">
          <JuryScoreActions scoring={scoring} />
        </div>
      )}
    </section>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Minus, Plus, Save, ShieldCheck } from "lucide-react";
import { NoticePanel } from "@/shared/components/account/AccountUI";
import type { NominationScoringDefinition } from "@/features/jury/scoring/category-scoring";

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

export default function JuryReviewScorecard({
  nominationId,
  scoringDefinition,
  initialReview,
}: {
  nominationId: string;
  scoringDefinition: NominationScoringDefinition;
  initialReview: JuryReviewValue | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<ReviewStatus>(initialReview?.status ?? "NOT_STARTED");
  const [values, setValues] = useState<Record<string, ScoreValue>>(() =>
    Object.fromEntries(
      scoringDefinition.criteria.map((criterion) => [
        criterion.key,
        toValue(initialReview?.scores[criterion.key]),
      ])
    )
  );
  const [comment, setComment] = useState(initialReview?.comment ?? "");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isComplete = status === "COMPLETED" || status === "LOCKED";
  const presentScoreCount = scoringDefinition.criteria.filter(
    (criterion) => values[criterion.key] !== ""
  ).length;
  const total = scoringDefinition.criteria.reduce<number>(
    (sum, criterion) => sum + (parseScore(values[criterion.key] ?? "") ?? 0),
    0
  );

  function setScore(key: string, next: number | "") {
    if (next === "") {
      setValues((current) => ({ ...current, [key]: "" }));
      return;
    }
    const maxScore = scoringDefinition.criteria.find((criterion) => criterion.key === key)?.maxScore ?? 0;
    const safe = Math.max(0, Math.min(maxScore, Math.round(next)));
    setValues((current) => ({ ...current, [key]: `${safe}` as ScoreValue }));
  }

  async function sendReview(mode: "draft" | "submit") {
    setError(null);
    setNotice(null);

    if (mode === "submit" && presentScoreCount !== scoringDefinition.criteria.length) {
      setError("Score every regulation criterion before completing this review.");
      return;
    }

    const response = await fetch(`/api/account/jury/nominations/${nominationId}/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scores: Object.fromEntries(
          scoringDefinition.criteria.map((criterion) => [
            criterion.key,
            parseScore(values[criterion.key] ?? ""),
          ])
        ),
        comment,
      }),
    });

    const payload = (await response.json().catch(() => null)) as { message?: string; status?: ReviewStatus } | null;
    if (!response.ok) {
      setError(payload?.message ?? "The review could not be saved.");
      return;
    }

    setStatus(payload?.status ?? (mode === "submit" ? "COMPLETED" : "IN_PROGRESS"));
    setNotice(mode === "draft" ? "Draft saved. You can safely return later." : "Review completed and submitted.");
    startTransition(() => router.refresh());
  }

  return (
    <section aria-labelledby="scorecard-heading" className="overflow-hidden rounded-[30px] border border-[rgba(114,160,193,0.2)] bg-white/82 shadow-[0_26px_80px_rgba(37,42,45,0.09)] backdrop-blur-2xl">
      <div className="border-b border-[rgba(37,42,45,0.08)] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-soft)]">Your decision</p>
            <h2 id="scorecard-heading" className="mt-1 font-[var(--font-title-family)] text-2xl font-light tracking-[-0.025em] text-[var(--color-ink)]">Jury scorecard</h2>
            <p className="mt-1 text-[0.68rem] leading-5 text-[var(--color-ink-soft)]">2026 {scoringDefinition.categoryName} regulation · {scoringDefinition.sourceDocument}</p>
          </div>
          <div className="rounded-[20px] border border-[rgba(114,160,193,0.2)] bg-[var(--color-blue-wash)] px-4 py-3 text-right">
            <p className="font-[var(--font-title-family)] text-3xl font-light leading-none text-[var(--color-ink)]">{total}<span className="text-base text-[var(--color-ink-soft)]"> / {scoringDefinition.maximumTotal}</span></p>
            <p className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">{presentScoreCount} of {scoringDefinition.criteria.length} scored</p>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[rgba(114,160,193,0.14)]">
          <div className="h-full rounded-full bg-[var(--color-blue)] transition-[width] duration-300" style={{ width: `${(presentScoreCount / scoringDefinition.criteria.length) * 100}%` }} />
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4 sm:p-5">
        {isComplete ? <NoticePanel tone="success" title="Review complete">Your final scores are read-only. An administrator can reopen this review if a correction is required.</NoticePanel> : null}

        {scoringDefinition.criteria.map((criterion) => (
          <div key={criterion.key} className="rounded-[24px] border border-[rgba(37,42,45,0.08)] bg-white/68 p-3">
            <div className="flex items-start justify-between gap-3">
              <label htmlFor={`score-${criterion.key}`} className="min-w-0 pt-1">
                <span className="block font-[var(--font-title-family)] text-[1.05rem] font-light leading-tight text-[var(--color-ink)]">{criterion.label}</span>
                <span className="mt-1 block text-[0.72rem] leading-5 text-[var(--color-ink-soft)]">{criterion.description}</span>
                <span className="mt-1.5 block text-[0.58rem] font-semibold uppercase tracking-[0.11em] text-[var(--color-blue)]">0-{criterion.maxScore} points</span>
              </label>
              <div className="grid shrink-0 grid-cols-[38px_52px_38px] items-center rounded-full border border-[rgba(114,160,193,0.22)] bg-white/90 p-1 shadow-sm">
                <button type="button" disabled={isComplete || isPending} onClick={() => setScore(criterion.key, (parseScore(values[criterion.key] ?? "") ?? 0) - 1)} aria-label={`Decrease ${criterion.label}`} className="flex size-[38px] items-center justify-center rounded-full text-[var(--color-blue)] transition hover:bg-[var(--color-blue-wash)] disabled:cursor-not-allowed disabled:opacity-40"><Minus aria-hidden size={14} /></button>
                <input id={`score-${criterion.key}`} type="number" min={0} max={criterion.maxScore} step={1} inputMode="numeric" value={values[criterion.key] ?? ""} disabled={isComplete || isPending} onChange={(event) => setScore(criterion.key, event.target.value === "" ? "" : Number(event.target.value))} aria-label={`${criterion.label}, zero to ${criterion.maxScore}`} className="h-[38px] w-full border-0 bg-transparent text-center font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)] outline-none disabled:cursor-not-allowed" />
                <button type="button" disabled={isComplete || isPending} onClick={() => setScore(criterion.key, (parseScore(values[criterion.key] ?? "") ?? 0) + 1)} aria-label={`Increase ${criterion.label}`} className="flex size-[38px] items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[var(--color-blue)] transition hover:bg-[var(--color-blue-light)] disabled:cursor-not-allowed disabled:opacity-40"><Plus aria-hidden size={14} /></button>
              </div>
            </div>
          </div>
        ))}

        <label htmlFor="jury-comment" className="rounded-[24px] border border-[rgba(37,42,45,0.08)] bg-white/68 p-4">
          <span className="font-[var(--font-title-family)] text-[1.05rem] font-light text-[var(--color-ink)]">Jury note <span className="font-[var(--font-ui-family)] text-xs text-[var(--color-ink-soft)]">(optional)</span></span>
          <textarea id="jury-comment" value={comment} disabled={isComplete || isPending} onChange={(event) => setComment(event.target.value)} rows={4} maxLength={5000} placeholder="Add concise context for the final decision…" className="mt-3 w-full resize-y rounded-[18px] border border-[rgba(114,160,193,0.2)] bg-white/82 px-4 py-3 text-sm leading-6 text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-ink-muted)] focus:border-[var(--color-blue)] focus:ring-4 focus:ring-[rgba(114,160,193,0.16)] disabled:cursor-not-allowed disabled:opacity-60" />
        </label>

        {error ? <NoticePanel tone="error" role="alert">{error}</NoticePanel> : null}
        {notice ? <NoticePanel tone="success" role="status">{notice}</NoticePanel> : null}

        {isComplete ? null : (
          <div className="grid gap-2 pt-1 sm:grid-cols-2">
            <button type="button" disabled={isPending} onClick={() => void sendReview("draft")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[rgba(114,160,193,0.28)] bg-white/82 px-5 text-[0.7rem] font-semibold uppercase tracking-[0.11em] text-[var(--color-ink)] transition hover:bg-[var(--color-blue-wash)] disabled:cursor-wait disabled:opacity-55"><Save aria-hidden size={15} />Save draft</button>
            <button type="button" disabled={isPending || presentScoreCount !== scoringDefinition.criteria.length} onClick={() => void sendReview("submit")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--color-blue)] px-5 text-[0.7rem] font-semibold uppercase tracking-[0.11em] text-white shadow-[0_14px_30px_rgba(114,160,193,0.24)] transition hover:bg-[#5f91b6] disabled:cursor-not-allowed disabled:opacity-45"><ShieldCheck aria-hidden size={15} />Complete review</button>
          </div>
        )}
      </div>
    </section>
  );
}

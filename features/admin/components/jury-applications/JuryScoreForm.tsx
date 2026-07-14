"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCircle2, Minus, PenSquare, Plus, Save } from "lucide-react";
import { formatAdminDate } from "@/features/admin/server/view-models";
import ScoreStatusBadge from "@/features/admin/components/scoring/ScoreStatusBadge";
import { adminT } from "@/lib/i18n/admin";
import {
  DashboardAccentBlock,
  DashboardCard,
  DashboardPrimaryBtn,
  DashboardSecondaryBtn,
  dashboardTextareaClass,
} from "@/shared/components/admin/DashboardUI";

type ScoreFormValue = "" | `${number}`;

type JuryScoreFormProps = {
  nominationApplicationId: string;
  initialScore: {
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
};

const criteria = [
  { key: "technical", label: adminT.scoring.criteria.technical },
  { key: "aesthetic", label: adminT.scoring.criteria.aesthetic },
  { key: "creativity", label: adminT.scoring.criteria.creativity },
  { key: "impact", label: adminT.scoring.criteria.impact },
  { key: "presentation", label: adminT.scoring.criteria.presentation },
] as const;

function toValue(value: number | null | undefined): ScoreFormValue {
  return typeof value === "number" ? `${value}` : "";
}

function parseScore(value: ScoreFormValue) {
  return value === "" ? null : Number(value);
}

export default function JuryScoreForm({ nominationApplicationId, initialScore }: JuryScoreFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [technical, setTechnical] = useState<ScoreFormValue>(toValue(initialScore?.technical));
  const [aesthetic, setAesthetic] = useState<ScoreFormValue>(toValue(initialScore?.aesthetic));
  const [creativity, setCreativity] = useState<ScoreFormValue>(toValue(initialScore?.creativity));
  const [impact, setImpact] = useState<ScoreFormValue>(toValue(initialScore?.impact));
  const [presentation, setPresentation] = useState<ScoreFormValue>(toValue(initialScore?.presentation));
  const [comment, setComment] = useState(initialScore?.comment ?? "");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isSubmitted = initialScore?.status === "SUBMITTED";
  const total = [technical, aesthetic, creativity, impact, presentation].reduce((sum, value) => {
    const parsed = parseScore(value);
    return sum + (parsed ?? 0);
  }, 0);

  async function sendScoreRequest(mode: "draft" | "submit") {
    setError(null);
    setNotice(null);

    const response = await fetch(`/api/jury/scoring/${nominationApplicationId}/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        technical: parseScore(technical),
        aesthetic: parseScore(aesthetic),
        creativity: parseScore(creativity),
        impact: parseScore(impact),
        presentation: parseScore(presentation),
        comment,
      }),
    });

    const payload = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setError(payload?.message ?? adminT.scoring.saveError);
      return;
    }

    setNotice(mode === "draft" ? adminT.scoring.draftSaved : adminT.scoring.finalSubmitted);
    startTransition(() => {
      router.refresh();
    });
  }

  const valueMap = {
    technical,
    aesthetic,
    creativity,
    impact,
    presentation,
  } satisfies Record<(typeof criteria)[number]["key"], ScoreFormValue>;
  const setterMap = {
    technical: setTechnical,
    aesthetic: setAesthetic,
    creativity: setCreativity,
    impact: setImpact,
    presentation: setPresentation,
  } satisfies Record<(typeof criteria)[number]["key"], (value: ScoreFormValue) => void>;

  function adjustScore(key: (typeof criteria)[number]["key"], delta: number) {
    const current = parseScore(valueMap[key]) ?? 0;
    const next = Math.max(0, Math.min(10, current + delta));
    setterMap[key](`${next}` as ScoreFormValue);
  }

  return (
    <DashboardCard className="p-0">
      <div className="border-b border-[rgba(37,42,45,0.08)] p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[var(--color-blue)]">
              <PenSquare aria-hidden size={15} />
            </span>
            <h2 className="font-[var(--font-title-family)] text-2xl font-light tracking-[-0.025em] text-[var(--color-ink)]">
              {adminT.scoring.scorecard}
            </h2>
          </div>
          <div className="text-right">
            <ScoreStatusBadge status={initialScore?.status ?? "NOT_STARTED"} />
            {initialScore?.submittedAt ? (
              <p className="mt-1.5 text-xs text-[var(--color-ink-muted)]">
                {formatAdminDate(new Date(initialScore.submittedAt))}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5">
        <DashboardAccentBlock className="overflow-visible">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
                {adminT.scoring.currentTotal}
              </p>
              <p className="mt-2 font-[var(--font-title-family)] text-5xl font-light tracking-[-0.05em]">
                {total}
                <span className="text-2xl text-[var(--color-ink-soft)]"> / 50</span>
              </p>
            </div>
            <div className="h-20 w-2 overflow-hidden rounded-full bg-white/72">
              <div
                className="mt-auto rounded-full bg-[var(--color-blue)] transition-all duration-500"
                style={{ height: `${Math.min(100, (total / 50) * 100)}%` }}
              />
            </div>
          </div>
        </DashboardAccentBlock>

        {initialScore?.status === "REOPENED" ? (
          <div className="rounded-[22px] border border-[rgba(114,160,193,0.34)] bg-[var(--color-blue-wash)] px-4 py-3 text-sm text-[var(--color-ink)]">
            {adminT.scoring.reopenedNotice}
          </div>
        ) : null}

        {isSubmitted ? (
          <div className="rounded-[22px] border border-[rgba(37,42,45,0.08)] bg-white/62 px-4 py-3 text-sm text-[var(--color-ink-soft)]">
            {adminT.scoring.submittedReadOnly}
          </div>
        ) : null}

        <div className="grid gap-3">
          {criteria.map((criterion) => (
            <label
              key={criterion.key}
              htmlFor={criterion.key}
              className="grid gap-3 rounded-[24px] border border-[rgba(37,42,45,0.08)] bg-white/62 p-3 shadow-[0_10px_26px_rgba(37,42,45,0.035)] sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <span>
                <span className="block font-[var(--font-title-family)] text-lg font-light leading-tight text-[var(--color-ink)]">
                  {criterion.label}
                </span>
                <span className="text-xs text-[var(--color-ink-muted)]">{adminT.scoring.range}</span>
              </span>
              <span className="grid grid-cols-[44px_minmax(0,72px)_44px] items-center rounded-full border border-[rgba(114,160,193,0.22)] bg-white/82 p-1 shadow-sm">
                <button
                  type="button"
                  disabled={isSubmitted || isPending}
                  onClick={(event) => {
                    event.preventDefault();
                    adjustScore(criterion.key, -1);
                  }}
                  className="flex size-10 items-center justify-center rounded-full text-[var(--color-blue)] transition hover:bg-[var(--color-blue-wash)] disabled:cursor-not-allowed disabled:opacity-45"
                  aria-label={adminT.scoring.decrease(criterion.label)}
                >
                  <Minus aria-hidden size={15} />
                </button>
                <input
                  id={criterion.key}
                  type="number"
                  min={0}
                  max={10}
                  step={1}
                  inputMode="numeric"
                  value={valueMap[criterion.key]}
                  disabled={isSubmitted || isPending}
                  onChange={(event) => setterMap[criterion.key](event.target.value as ScoreFormValue)}
                  className="h-10 w-full rounded-full border-0 bg-transparent text-center font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)] outline-none disabled:cursor-not-allowed disabled:opacity-65"
                />
                <button
                  type="button"
                  disabled={isSubmitted || isPending}
                  onClick={(event) => {
                    event.preventDefault();
                    adjustScore(criterion.key, 1);
                  }}
                  className="flex size-10 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[var(--color-blue)] transition hover:bg-[var(--color-blue-light)] disabled:cursor-not-allowed disabled:opacity-45"
                  aria-label={adminT.scoring.increase(criterion.label)}
                >
                  <Plus aria-hidden size={15} />
                </button>
              </span>
            </label>
          ))}
        </div>

        <label className="block rounded-[24px] border border-[rgba(37,42,45,0.08)] bg-white/62 p-3" htmlFor="comment">
          <span className="font-[var(--font-title-family)] text-lg font-light text-[var(--color-ink)]">
            {adminT.scoring.judgeComment}
          </span>
          <textarea
            id="comment"
            value={comment}
            disabled={isSubmitted || isPending}
            onChange={(event) => setComment(event.target.value)}
            rows={4}
            className={`${dashboardTextareaClass} mt-2 disabled:cursor-not-allowed disabled:opacity-65`}
          />
        </label>

        {error ? (
          <div className="rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        {notice ? (
          <div className="rounded-[22px] border border-[rgba(114,160,193,0.34)] bg-[var(--color-blue-wash)] px-4 py-3 text-sm text-[var(--color-ink)]">
            {notice}
          </div>
        ) : null}

        {!isSubmitted ? (
          <div className="grid gap-2 sm:grid-cols-2">
            <DashboardSecondaryBtn
              type="button"
              disabled={isPending}
              onClick={() => {
                void sendScoreRequest("draft");
              }}
            >
              <Save aria-hidden size={15} />
              {adminT.scoring.saveDraft}
            </DashboardSecondaryBtn>
            <DashboardPrimaryBtn
              type="button"
              disabled={isPending}
              onClick={() => {
                void sendScoreRequest("submit");
              }}
            >
              <CheckCircle2 aria-hidden size={15} />
              {adminT.scoring.submitFinal}
            </DashboardPrimaryBtn>
          </div>
        ) : null}
      </div>
    </DashboardCard>
  );
}

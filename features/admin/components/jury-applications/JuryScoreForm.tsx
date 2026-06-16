"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { formatAdminDate } from "@/features/admin/server/view-models";
import ScoreStatusBadge from "@/features/admin/components/scoring/ScoreStatusBadge";
import { DashboardCard, dashboardInputClass, dashboardTextareaClass } from "@/shared/components/admin/DashboardUI";

type ScoreFormValue = "" | `${number}`;

type JuryScoreFormProps = {
  applicationId: string;
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
  { key: "technical", label: "Technical Execution" },
  { key: "aesthetic", label: "Aesthetic Appeal" },
  { key: "creativity", label: "Creativity / Originality" },
  { key: "impact", label: "Professional Impact" },
  { key: "presentation", label: "Presentation / Portfolio" },
] as const;

function toValue(value: number | null | undefined): ScoreFormValue {
  return typeof value === "number" ? `${value}` : "";
}

function parseScore(value: ScoreFormValue) {
  return value === "" ? null : Number(value);
}

export default function JuryScoreForm({ applicationId, initialScore }: JuryScoreFormProps) {
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

    const response = await fetch(`/api/jury/scoring/${applicationId}/${mode}`, {
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
      setError(payload?.message ?? "We could not save this score right now.");
      return;
    }

    setNotice(mode === "draft" ? "Draft saved." : "Final score submitted.");
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <DashboardCard>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">
            Judge Scorecard
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-[#10203B]">Scoring</h2>
        </div>
        <div className="text-right">
          <ScoreStatusBadge status={initialScore?.status ?? "NOT_STARTED"} />
          {initialScore?.submittedAt && (
            <p className="mt-1.5 text-xs text-slate-500">
              Submitted {formatAdminDate(new Date(initialScore.submittedAt))}
            </p>
          )}
        </div>
      </div>

      {initialScore?.status === "REOPENED" && (
        <div className="mt-4 rounded-[16px] border border-[#4C7D9D]/30 bg-[#4C7D9D]/5 px-4 py-3 text-sm text-[#10203B]">
          An admin reopened this score. You can update your draft and submit again.
        </div>
      )}

      {isSubmitted && (
        <div className="mt-4 rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          This score has been submitted and is now read-only. Only an admin can reopen it.
        </div>
      )}

      <div className="mt-5 space-y-4">
        {criteria.map((criterion) => {
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

          return (
            <div key={criterion.key}>
              <label
                htmlFor={criterion.key}
                className="mb-1.5 block text-sm font-semibold text-[#10203B]"
              >
                {criterion.label}
              </label>
              <input
                id={criterion.key}
                type="number"
                min={0}
                max={10}
                step={1}
                inputMode="numeric"
                value={valueMap[criterion.key]}
                disabled={isSubmitted || isPending}
                onChange={(e) => setterMap[criterion.key](e.target.value as ScoreFormValue)}
                className={dashboardInputClass + " disabled:cursor-not-allowed disabled:opacity-65"}
              />
            </div>
          );
        })}

        <div>
          <label htmlFor="comment" className="mb-1.5 block text-sm font-semibold text-[#10203B]">
            Judge comment (optional)
          </label>
          <textarea
            id="comment"
            value={comment}
            disabled={isSubmitted || isPending}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className={dashboardTextareaClass + " disabled:cursor-not-allowed disabled:opacity-65"}
          />
        </div>

        <div className="rounded-[16px] border border-slate-200 bg-slate-50/60 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">Total</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-[#10203B]">{total} / 50</p>
        </div>

        {error && (
          <div className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {notice && (
          <div className="rounded-[16px] border border-[#4C7D9D]/30 bg-[#4C7D9D]/5 px-4 py-3 text-sm text-[#10203B]">
            {notice}
          </div>
        )}

        {!isSubmitted && (
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={isPending}
              onClick={() => { void sendScoreRequest("draft"); }}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700 transition hover:border-[#4C7D9D]/40 hover:text-[#10203B] disabled:cursor-not-allowed disabled:opacity-65"
            >
              Save Draft
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => { void sendScoreRequest("submit"); }}
              className="inline-flex items-center justify-center rounded-2xl bg-[#10203B] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#1a3357] disabled:cursor-not-allowed disabled:opacity-65"
            >
              Submit Final Score
            </button>
          </div>
        )}
      </div>
    </DashboardCard>
  );
}

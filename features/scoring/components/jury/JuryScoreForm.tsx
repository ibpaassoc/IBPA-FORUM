"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { formatAdminDate } from "@/features/admin/server/view-models";
import ScoreStatusBadge from "@/features/scoring/components/ScoreStatusBadge";

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

export default function JuryScoreForm({
  applicationId,
  initialScore,
}: JuryScoreFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [technical, setTechnical] = useState<ScoreFormValue>(
    toValue(initialScore?.technical)
  );
  const [aesthetic, setAesthetic] = useState<ScoreFormValue>(
    toValue(initialScore?.aesthetic)
  );
  const [creativity, setCreativity] = useState<ScoreFormValue>(
    toValue(initialScore?.creativity)
  );
  const [impact, setImpact] = useState<ScoreFormValue>(toValue(initialScore?.impact));
  const [presentation, setPresentation] = useState<ScoreFormValue>(
    toValue(initialScore?.presentation)
  );
  const [comment, setComment] = useState(initialScore?.comment ?? "");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isSubmitted = initialScore?.status === "SUBMITTED";
  const total =
    [technical, aesthetic, creativity, impact, presentation].reduce((sum, value) => {
      const parsed = parseScore(value);
      return sum + (parsed ?? 0);
    }, 0) ?? 0;

  async function sendScoreRequest(mode: "draft" | "submit") {
    setError(null);
    setNotice(null);

    const response = await fetch(`/api/jury/scoring/${applicationId}/${mode}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        technical: parseScore(technical),
        aesthetic: parseScore(aesthetic),
        creativity: parseScore(creativity),
        impact: parseScore(impact),
        presentation: parseScore(presentation),
        comment,
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { message?: string }
      | null;

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
    <section className="page-card rounded-3xl p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
            Judge Scorecard
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-white">Scoring</h2>
        </div>

        <div className="text-right">
          <ScoreStatusBadge status={initialScore?.status ?? "NOT_STARTED"} />
          {initialScore?.submittedAt ? (
            <p className="mt-2 text-xs text-[#d9d4ca]/75">
              Submitted {formatAdminDate(new Date(initialScore.submittedAt))}
            </p>
          ) : null}
        </div>
      </div>

      {initialScore?.status === "REOPENED" ? (
        <div className="mt-5 rounded-2xl border border-[#5577a8]/40 bg-[#2c3d5a]/25 px-4 py-3 text-sm text-[#d7e7ff]">
          An admin reopened this score. You can update your draft and submit again.
        </div>
      ) : null}

      {isSubmitted ? (
        <div className="mt-5 rounded-2xl border border-[#3e8f62]/45 bg-[#1b4d34]/25 px-4 py-3 text-sm text-[#cdebd6]">
          This score has been submitted and is now read-only. Only an admin can reopen
          it.
        </div>
      ) : null}

      <div className="mt-6 space-y-5">
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
          } satisfies Record<
            (typeof criteria)[number]["key"],
            (value: ScoreFormValue) => void
          >;

          return (
            <div key={criterion.key}>
              <label
                htmlFor={criterion.key}
                className="mb-2 block text-sm font-medium text-white"
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
                onChange={(event) => setterMap[criterion.key](event.target.value as ScoreFormValue)}
                className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-[#d8c27a] focus:bg-white/7 disabled:cursor-not-allowed disabled:opacity-65"
              />
            </div>
          );
        })}

        <div>
          <label htmlFor="comment" className="mb-2 block text-sm font-medium text-white">
            Judge Comment (Optional)
          </label>
          <textarea
            id="comment"
            value={comment}
            disabled={isSubmitted || isPending}
            onChange={(event) => setComment(event.target.value)}
            rows={5}
            className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-[#d8c27a] focus:bg-white/7 disabled:cursor-not-allowed disabled:opacity-65"
          />
        </div>

        <div className="rounded-2xl border border-white/12 bg-white/[0.035] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d8c27a]">
            Total
          </p>
          <p className="mt-3 text-3xl font-semibold text-white">{total} / 50</p>
        </div>

        {error ? (
          <p className="rounded-2xl border border-[#9d4a4a]/35 bg-[#5c2323]/25 px-4 py-3 text-sm text-[#f3c7c7]">
            {error}
          </p>
        ) : null}

        {notice ? (
          <p className="rounded-2xl border border-[#3e8f62]/45 bg-[#1b4d34]/25 px-4 py-3 text-sm text-[#cdebd6]">
            {notice}
          </p>
        ) : null}

        {!isSubmitted ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                void sendScoreRequest("draft");
              }}
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#d8c27a] hover:text-[#d8c27a] disabled:cursor-not-allowed disabled:opacity-65"
            >
              Save Draft
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                void sendScoreRequest("submit");
              }}
              className="inline-flex items-center justify-center rounded-full bg-[#d8c27a] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#e2d093] disabled:cursor-not-allowed disabled:opacity-65"
            >
              Submit Final Score
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

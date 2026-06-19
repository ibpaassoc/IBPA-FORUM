"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CheckCircle2, PenSquare, Save } from "lucide-react";
import { formatAdminDate } from "@/features/admin/server/view-models";
import ScoreStatusBadge from "@/features/admin/components/scoring/ScoreStatusBadge";
import {
  DashboardAccentBlock,
  DashboardCard,
  DashboardPrimaryBtn,
  DashboardSecondaryBtn,
  dashboardInputClass,
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
  { key: "technical", label: "Technical" },
  { key: "aesthetic", label: "Aesthetic" },
  { key: "creativity", label: "Creativity" },
  { key: "impact", label: "Impact" },
  { key: "presentation", label: "Presentation" },
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
      setError(payload?.message ?? "We could not save this score right now.");
      return;
    }

    setNotice(mode === "draft" ? "Draft saved." : "Final score submitted.");
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

  return (
    <DashboardCard className="p-0">
      <div className="border-b border-black/10 p-4 md:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[#1673A5]">
              <PenSquare aria-hidden size={16} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em]">Scorecard</p>
            </div>
            <h2 className="mt-2 text-2xl font-semibold normal-case tracking-[-0.02em] text-[#0A0A0A]">
              Judge score
            </h2>
          </div>
          <div className="text-right">
            <ScoreStatusBadge status={initialScore?.status ?? "NOT_STARTED"} />
            {initialScore?.submittedAt ? (
              <p className="mt-1.5 text-xs text-black/45">
                {formatAdminDate(new Date(initialScore.submittedAt))}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-4 md:p-5">
        <DashboardAccentBlock>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
            Current total
          </p>
          <p className="mt-2 text-4xl font-semibold tracking-[-0.04em]">{total} / 50</p>
        </DashboardAccentBlock>

        {initialScore?.status === "REOPENED" ? (
          <div className="rounded-lg border border-[#7DC8EE] bg-[#EAF6FF] px-4 py-3 text-sm text-[#0A0A0A]">
            This score was reopened by an admin.
          </div>
        ) : null}

        {isSubmitted ? (
          <div className="rounded-lg border border-black/10 bg-[#FAFAFA] px-4 py-3 text-sm text-black/60">
            Submitted scores are read-only until reopened.
          </div>
        ) : null}

        <div className="grid gap-2">
          {criteria.map((criterion) => (
            <label
              key={criterion.key}
              htmlFor={criterion.key}
              className="grid gap-2 rounded-lg border border-black/10 bg-[#FAFAFA] p-3 sm:grid-cols-[1fr_96px] sm:items-center"
            >
              <span>
                <span className="block text-sm font-semibold text-[#0A0A0A]">{criterion.label}</span>
                <span className="text-xs text-black/45">0 to 10</span>
              </span>
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
                className={`${dashboardInputClass} text-lg font-semibold disabled:cursor-not-allowed disabled:opacity-65`}
              />
            </label>
          ))}
        </div>

        <label className="block rounded-lg border border-black/10 bg-[#FAFAFA] p-3" htmlFor="comment">
          <span className="text-sm font-semibold text-[#0A0A0A]">Judge comment</span>
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
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}
        {notice ? (
          <div className="rounded-lg border border-[#7DC8EE] bg-[#EAF6FF] px-4 py-3 text-sm text-[#0A0A0A]">
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
              Save draft
            </DashboardSecondaryBtn>
            <DashboardPrimaryBtn
              type="button"
              disabled={isPending}
              onClick={() => {
                void sendScoreRequest("submit");
              }}
            >
              <CheckCircle2 aria-hidden size={15} />
              Submit final
            </DashboardPrimaryBtn>
          </div>
        ) : null}
      </div>
    </DashboardCard>
  );
}

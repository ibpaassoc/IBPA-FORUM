"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { formatAdminDate } from "@/features/admin/server/view-models";
import ScoreStatusBadge from "@/features/admin/components/scoring/ScoreStatusBadge";
import {
  AdminSection,
  AdminToolbarButton,
} from "@/shared/components/admin/AdminDashboard";

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
    <AdminSection>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="admin-eyebrow">Judge Scorecard</p>
          <h2 className="admin-heading mt-3 text-2xl font-semibold">Scoring</h2>
        </div>

        <div className="text-right">
          <ScoreStatusBadge status={initialScore?.status ?? "NOT_STARTED"} />
          {initialScore?.submittedAt ? (
            <p className="admin-muted mt-2 text-xs">
              Submitted {formatAdminDate(new Date(initialScore.submittedAt))}
            </p>
          ) : null}
        </div>
      </div>

      {initialScore?.status === "REOPENED" ? (
        <div className="admin-detail-card mt-5 rounded-2xl px-4 py-3 text-sm">
          An admin reopened this score. You can update your draft and submit again.
        </div>
      ) : null}

      {isSubmitted ? (
        <div className="mt-5 rounded-2xl border border-[rgba(184,148,83,0.34)] bg-(--admin-gold-soft) px-4 py-3 text-sm admin-label">
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
                className="admin-label mb-2 block text-sm font-semibold"
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
                className="admin-field w-full rounded-2xl px-4 py-3 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-65"
              />
            </div>
          );
        })}

        <div>
          <label htmlFor="comment" className="admin-label mb-2 block text-sm font-semibold">
            Judge Comment (Optional)
          </label>
          <textarea
            id="comment"
            value={comment}
            disabled={isSubmitted || isPending}
            onChange={(event) => setComment(event.target.value)}
            rows={5}
            className="admin-field w-full rounded-2xl px-4 py-3 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-65"
          />
        </div>

        <div className="admin-detail-card rounded-2xl p-4">
          <p className="admin-eyebrow">Total</p>
          <p className="admin-heading mt-3 text-3xl font-semibold">{total} / 50</p>
        </div>

        {error ? (
          <p className="admin-alert-danger rounded-2xl px-4 py-3 text-sm">
            {error}
          </p>
        ) : null}

        {notice ? (
          <p className="admin-alert-note rounded-2xl px-4 py-3 text-sm">
            {notice}
          </p>
        ) : null}

        {!isSubmitted ? (
          <div className="flex flex-col gap-3 sm:flex-row">
            <AdminToolbarButton
              disabled={isPending}
              onClick={() => {
                void sendScoreRequest("draft");
              }}
            >
              Save Draft
            </AdminToolbarButton>
            <AdminToolbarButton
              disabled={isPending}
              onClick={() => {
                void sendScoreRequest("submit");
              }}
              variant="primary"
            >
              Submit Final Score
            </AdminToolbarButton>
          </div>
        ) : null}
      </div>
    </AdminSection>
  );
}

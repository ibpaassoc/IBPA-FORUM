"use client";

import { useState } from "react";
import { CalendarClock, ClipboardX, Send, Timer } from "lucide-react";
import { adminT } from "@/lib/i18n/admin";
import type { NominationScoringDefinition } from "@/features/jury/scoring/category-scoring";
import AdminReopenScoreButton from "@/features/admin/components/scoring/AdminReopenScoreButton";
import CriteriaScoreGrid, {
  criterionLabel,
} from "@/features/admin/components/scoring/CriteriaScoreGrid";
import JudgeCommentPreview from "@/features/admin/components/scoring/JudgeCommentPreview";
import ScoreAvatar from "@/features/admin/components/scoring/ScoreAvatar";
import ScoreProgress from "@/features/admin/components/scoring/ScoreProgress";
import ScoreStatusBadge from "@/features/admin/components/scoring/ScoreStatusBadge";
import { Drawer } from "@/shared/components/admin/DashboardUI";

export type JudgeReviewRow = {
  judgeId: string;
  judgeName: string;
  judgeEmail: string;
  judgeTitle: string | null;
  reviewId: string | null;
  scores: Record<string, number | null>;
  completion: { filled: number; total: number; percentage: number };
  totalScore: number | null;
  totalPercentage: number | null;
  comment: string | null;
  scoreStatus: "NOT_STARTED" | "DRAFT" | "SUBMITTED" | "REOPENED";
  startedAtLabel: string | null;
  submittedAtLabel: string | null;
  updatedAtLabel: string | null;
  lastActivityTime: number;
};

function TimelineItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarClock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-1.5">
      <Icon aria-hidden size={13} className="mt-[0.15rem] shrink-0 text-[var(--color-ink-muted)]" />
      <p className="min-w-0 text-[0.72rem] leading-[1.4] text-[var(--color-ink-soft)]">
        <span className="text-[var(--color-ink-muted)]">{label}: </span>
        <span className="break-words">{value}</span>
      </p>
    </div>
  );
}

/**
 * Карточка отзыва одного судьи.
 *
 * Три состояния: отправленный отзыв (все критерии, итог, комментарий),
 * черновик (заполненные критерии, «—» у пустых и прогресс заполнения) и
 * «не начато» — вместо пустой сетки показывается понятная заглушка.
 */
export default function JudgeReviewCard({
  row,
  scoringDefinition,
}: {
  row: JudgeReviewRow;
  scoringDefinition: NominationScoringDefinition;
}) {
  const [reviewOpen, setReviewOpen] = useState(false);
  const isNotStarted = row.scoreStatus === "NOT_STARTED";
  const isSubmitted = row.scoreStatus === "SUBMITTED" || row.scoreStatus === "REOPENED";

  return (
    <div className="p-4 md:p-5">
      {/* Судья, статус и действия */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <ScoreAvatar name={row.judgeName} size="sm" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="min-w-0 break-words text-[0.92rem] font-medium text-[var(--color-ink)]">
                {row.judgeName}
              </p>
              <ScoreStatusBadge status={row.scoreStatus} />
            </div>
            <p className="mt-0.5 break-all text-[0.78rem] text-[var(--color-ink-soft)]">
              {row.judgeEmail}
            </p>
            {row.judgeTitle ? (
              <p className="mt-2 inline-flex max-w-full rounded-full border border-[rgba(114,160,193,0.2)] bg-[var(--color-blue-wash)] px-2.5 py-1 text-[0.68rem] leading-tight text-[#356f98]">
                <span className="line-clamp-2">{row.judgeTitle}</span>
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isNotStarted ? (
            <button
              type="button"
              onClick={() => setReviewOpen(true)}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[rgba(114,160,193,0.24)] bg-white/80 px-4 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink)] transition hover:-translate-y-0.5 hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)]"
            >
              {adminT.scoring.openReview}
            </button>
          ) : null}
          {row.reviewId && isSubmitted ? <AdminReopenScoreButton reviewId={row.reviewId} /> : null}
        </div>
      </div>

      {/* Даты работы судьи над заявкой */}
      {row.startedAtLabel || row.submittedAtLabel || row.updatedAtLabel ? (
        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
          {row.startedAtLabel ? (
            <TimelineItem
              icon={Timer}
              label={adminT.scoring.startedAt}
              value={row.startedAtLabel}
            />
          ) : null}
          {row.submittedAtLabel ? (
            <TimelineItem
              icon={Send}
              label={adminT.scoring.submittedAt}
              value={row.submittedAtLabel}
            />
          ) : null}
          {!row.submittedAtLabel && row.updatedAtLabel ? (
            <TimelineItem
              icon={CalendarClock}
              label={adminT.scoring.updatedAt}
              value={row.updatedAtLabel}
            />
          ) : null}
        </div>
      ) : null}

      {/* Оценка */}
      {isNotStarted ? (
        <div className="mt-3 flex items-center gap-3 rounded-[20px] border border-dashed border-[rgba(114,160,193,0.28)] bg-white/50 px-4 py-5">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[var(--color-blue)]">
            <ClipboardX aria-hidden size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-[0.9rem] font-medium text-[var(--color-ink)]">
              {adminT.scoring.notStartedTitle}
            </p>
            <p className="mt-1 text-[0.8rem] leading-[1.5] text-[var(--color-ink-soft)]">
              {adminT.scoring.notStartedText}
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-3 min-w-0">
          <div className="flex flex-wrap items-end gap-x-5 gap-y-2">
            <div>
              <p className="font-[var(--font-title-family)] text-[1.75rem] font-light leading-none tracking-[-0.03em] text-[var(--color-ink)]">
                {row.totalScore ?? "—"}
                <span className="text-[0.9rem] text-[var(--color-ink-muted)]">
                  {" "}
                  / {scoringDefinition.maximumTotal}
                </span>
              </p>
              {row.totalPercentage !== null ? (
                <p className="mt-1 text-[0.72rem] uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
                  {row.totalPercentage}%
                </p>
              ) : null}
            </div>

            {!isSubmitted ? (
              <div className="min-w-[180px] flex-1">
                <ScoreProgress
                  percentage={row.completion.percentage}
                  label={adminT.scoring.reviewProgress(
                    row.completion.filled,
                    row.completion.total,
                  )}
                  hint={`${row.completion.percentage}%`}
                />
              </div>
            ) : null}
          </div>

          <CriteriaScoreGrid
            className="mt-3"
            criteria={scoringDefinition.criteria}
            scores={row.scores}
          />

          {row.comment ? (
            <JudgeCommentPreview
              className="mt-3"
              comment={row.comment}
              onOpenReview={() => setReviewOpen(true)}
            />
          ) : null}
        </div>
      )}

      <Drawer open={reviewOpen} onOpenChange={setReviewOpen} title={adminT.scoring.reviewDialogTitle}>
        <div className="flex items-start gap-3">
          <ScoreAvatar name={row.judgeName} size="sm" />
          <div className="min-w-0">
            <p className="break-words text-[0.95rem] font-medium text-[var(--color-ink)]">
              {row.judgeName}
            </p>
            <p className="mt-0.5 break-all text-[0.8rem] text-[var(--color-ink-soft)]">
              {row.judgeEmail}
            </p>
          </div>
          <ScoreStatusBadge status={row.scoreStatus} className="ml-auto shrink-0" />
        </div>

        <div className="mt-4 rounded-[20px] border border-[rgba(37,42,45,0.08)] bg-white/70 p-4">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
            {adminT.scoring.criteria.total}
          </p>
          <p className="mt-1.5 font-[var(--font-title-family)] text-[1.7rem] font-light leading-none tracking-[-0.03em] text-[var(--color-ink)]">
            {row.totalScore ?? "—"}
            <span className="text-[0.9rem] text-[var(--color-ink-muted)]">
              {" "}
              / {scoringDefinition.maximumTotal}
            </span>
          </p>
        </div>

        <ul className="mt-4 flex flex-col gap-2">
          {scoringDefinition.criteria.map((criterion) => {
            const value = row.scores[criterion.key];

            return (
              <li
                key={criterion.key}
                className="flex items-start justify-between gap-3 rounded-[16px] border border-[rgba(37,42,45,0.07)] bg-white/60 px-3 py-2.5"
              >
                <span className="min-w-0 break-words text-[0.82rem] leading-[1.45] text-[var(--color-ink-soft)]">
                  {criterionLabel(criterion)}
                </span>
                <span className="shrink-0 text-[0.85rem] font-medium text-[var(--color-ink)]">
                  {typeof value === "number" ? value : "—"}
                  <span className="text-[var(--color-ink-muted)]"> / {criterion.maxScore}</span>
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-4">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
            {adminT.scoring.judgeComment}
          </p>
          <p className="mt-2 whitespace-pre-line break-words text-[0.87rem] leading-[1.65] text-[var(--color-ink-soft)]">
            {row.comment ?? adminT.scoring.noComment}
          </p>
        </div>

        {row.submittedAtLabel || row.updatedAtLabel ? (
          <div className="mt-4 flex flex-col gap-1.5 border-t border-[rgba(37,42,45,0.08)] pt-3">
            {row.startedAtLabel ? (
              <TimelineItem
                icon={Timer}
                label={adminT.scoring.startedAt}
                value={row.startedAtLabel}
              />
            ) : null}
            {row.submittedAtLabel ? (
              <TimelineItem
                icon={Send}
                label={adminT.scoring.submittedAt}
                value={row.submittedAtLabel}
              />
            ) : null}
            {row.updatedAtLabel ? (
              <TimelineItem
                icon={CalendarClock}
                label={adminT.scoring.updatedAt}
                value={row.updatedAtLabel}
              />
            ) : null}
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}

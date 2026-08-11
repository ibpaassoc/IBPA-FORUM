import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Download, FolderOpen, Medal, TriangleAlert, Users } from "lucide-react";
import { adminT } from "@/lib/i18n/admin";
import ScoreAvatar from "@/features/admin/components/scoring/ScoreAvatar";
import ScoreProgress from "@/features/admin/components/scoring/ScoreProgress";
import ScoreStatusBadge from "@/features/admin/components/scoring/ScoreStatusBadge";
import { GlassCard } from "@/shared/components/admin/DashboardUI";

export type NominationScoreRowData = {
  id: string;
  shortId: string;
  fullName: string;
  email: string;
  categoryName: string;
  awardName: string;
  assignedJudgeCount: number;
  submittedJudgeCount: number;
  progressPercentage: number;
  averageScore: number | null;
  averageScoreLabel: string;
  averagePercentage: number | null;
  maximumTotal: number | null;
  minScore: number | null;
  maxScore: number | null;
  spreadLevel: "LOW" | "MEDIUM" | "HIGH" | null;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE";
  rank: number | null;
  lastActivityLabel: string;
};

const EMPTY = "—";

function MetricCell({
  value,
  caption,
  tone = "default",
}: {
  value: ReactNode;
  caption: string;
  tone?: "default" | "muted" | "accent";
}) {
  return (
    <div className="min-w-0">
      <p
        className={`font-[var(--font-title-family)] text-[1.35rem] font-light leading-none tracking-[-0.02em] ${
          tone === "muted"
            ? "text-[var(--color-ink-muted)]"
            : tone === "accent"
              ? "text-[var(--color-blue)]"
              : "text-[var(--color-ink)]"
        }`}
      >
        {value}
      </p>
      <p className="mt-1.5 text-[0.62rem] uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
        {caption}
      </p>
    </div>
  );
}

/**
 * Строка номинации в аудите оценок.
 *
 * На широком экране — горизонтальная строка (участник, номинация, статус,
 * жюри, баллы, действия), на узком — стопка карточек: сначала участник,
 * номинация, статус и балл, затем прогресс и вторичные метрики.
 */
export default function NominationScoreRow({ row }: { row: NominationScoreRowData }) {
  const hasScores = row.averageScore !== null;
  const rangeLabel =
    row.minScore === null || row.maxScore === null
      ? EMPTY
      : `${row.minScore.toFixed(1)} – ${row.maxScore.toFixed(1)}`;

  return (
    <GlassCard className="rounded-[26px] p-4 transition duration-300 hover:border-[rgba(114,160,193,0.34)] hover:shadow-[0_24px_64px_rgba(114,160,193,0.16)] md:p-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)_auto] xl:items-center xl:gap-5">
        {/* Участник */}
        <div className="flex min-w-0 items-start gap-3">
          <ScoreAvatar name={row.fullName} />
          <div className="min-w-0">
            <p className="truncate text-[0.95rem] font-medium text-[var(--color-ink)]">
              {row.fullName}
            </p>
            <p className="mt-0.5 truncate text-[0.8rem] text-[var(--color-ink-soft)]">
              {row.email || EMPTY}
            </p>
            <p className="mt-1.5 inline-flex max-w-full items-center rounded-full border border-[rgba(37,42,45,0.08)] bg-white/70 px-2 py-0.5 text-[0.62rem] uppercase tracking-[0.08em] text-[var(--color-ink-muted)]">
              <span className="truncate">
                {adminT.scoring.nominationId}: {row.shortId}
              </span>
            </p>
          </div>
        </div>

        {/* Номинация и категория */}
        <div className="min-w-0">
          <p className="font-[var(--font-title-family)] text-[1.15rem] font-light leading-[1.3] tracking-[-0.02em] text-[var(--color-ink)]">
            {row.awardName}
          </p>
          <p className="mt-1.5 flex items-center gap-1.5 text-[0.8rem] text-[var(--color-ink-soft)]">
            <FolderOpen aria-hidden size={13} className="shrink-0 text-[var(--color-ink-muted)]" />
            <span className="min-w-0 break-words">{row.categoryName}</span>
          </p>
        </div>

        {/* Действия */}
        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <Link
            href={`/admin/scoring/${row.id}`}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[rgba(114,160,193,0.28)] bg-white/80 px-4 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink)] transition hover:-translate-y-0.5 hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)]"
          >
            {adminT.scoring.openNomination}
            <ArrowRight aria-hidden size={14} />
          </Link>
          <a
            href={`/api/admin/scoring/${row.id}/export`}
            title={adminT.scoring.exportCsv}
            aria-label={adminT.scoring.exportCsv}
            className="inline-flex size-10 items-center justify-center rounded-full border border-[rgba(114,160,193,0.22)] bg-white/78 text-[var(--color-ink-soft)] transition hover:-translate-y-0.5 hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)]"
          >
            <Download aria-hidden size={15} />
          </a>
        </div>
      </div>

      {/* Оценивание */}
      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[rgba(37,42,45,0.07)] pt-4 xl:grid-cols-[minmax(0,200px)_minmax(0,200px)_repeat(3,minmax(0,1fr))_minmax(0,150px)] xl:items-start xl:gap-4">
        <div className="min-w-0">
          <ScoreStatusBadge status={row.status} />
          <p className="mt-2 text-[0.72rem] text-[var(--color-ink-muted)]">
            {adminT.scoring.juryProgress(row.progressPercentage)}
          </p>
        </div>

        <div className="min-w-0">
          {row.assignedJudgeCount === 0 ? (
            // Номинация без назначенных судей — самый частый повод для правки.
            <p className="flex items-center gap-1.5 text-[0.8rem] text-[var(--color-blue)]">
              <TriangleAlert aria-hidden size={13} className="shrink-0" />
              <span className="min-w-0 break-words">{adminT.scoring.noJudgesAssigned}</span>
            </p>
          ) : (
            <>
              <div className="flex items-center gap-1.5 text-[0.8rem] text-[var(--color-ink-soft)]">
                <Users aria-hidden size={13} className="shrink-0 text-[var(--color-ink-muted)]" />
                <span className="font-medium text-[var(--color-ink)]">
                  {row.assignedJudgeCount}
                </span>
                <span className="truncate">{adminT.scoring.assignedShort}</span>
              </div>
              <p className="mt-1 text-[0.8rem] text-[var(--color-ink-soft)]">
                <span className="font-medium text-[var(--color-ink)]">
                  {row.submittedJudgeCount} / {row.assignedJudgeCount}
                </span>{" "}
                {adminT.scoring.scoresShort}
              </p>
              <ScoreProgress className="mt-2" percentage={row.progressPercentage} />
            </>
          )}
        </div>

        <MetricCell
          value={hasScores ? row.averageScoreLabel : EMPTY}
          caption={adminT.scoring.averageShort}
          tone={hasScores ? "default" : "muted"}
        />

        <div className="min-w-0">
          <p
            className={`font-[var(--font-title-family)] text-[1.35rem] font-light leading-none tracking-[-0.02em] ${
              row.minScore === null ? "text-[var(--color-ink-muted)]" : "text-[var(--color-ink)]"
            }`}
          >
            {rangeLabel}
          </p>
          <p className="mt-1.5 flex items-center gap-1 text-[0.62rem] uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
            {row.spreadLevel === "HIGH" ? (
              <TriangleAlert
                aria-hidden
                size={12}
                className="shrink-0 text-[var(--color-blue)]"
              />
            ) : null}
            <span className="truncate">
              {row.spreadLevel === "HIGH"
                ? adminT.scoring.spreadHigh
                : adminT.scoring.rangeShort}
            </span>
          </p>
        </div>

        <div className="min-w-0">
          <p className="flex items-center gap-1.5 font-[var(--font-title-family)] text-[1.35rem] font-light leading-none tracking-[-0.02em] text-[var(--color-ink)]">
            {row.rank ? (
              <>
                {row.rank <= 3 ? (
                  <Medal aria-hidden size={16} className="shrink-0 text-[var(--color-blue)]" />
                ) : null}
                {row.rank}
              </>
            ) : (
              <span className="text-[var(--color-ink-muted)]">{EMPTY}</span>
            )}
          </p>
          <p className="mt-1.5 text-[0.62rem] uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
            {adminT.scoring.rankShort}
          </p>
        </div>

        <div className="min-w-0 xl:text-right">
          <p className="text-[0.8rem] leading-[1.4] text-[var(--color-ink-soft)]">
            {row.lastActivityLabel}
          </p>
          <p className="mt-1.5 text-[0.62rem] uppercase tracking-[0.1em] text-[var(--color-ink-muted)]">
            {adminT.scoring.columnUpdated}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}

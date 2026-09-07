"use client";

import { Fragment, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Trophy } from "lucide-react";
import { adminT } from "@/lib/i18n/admin";
import { DashboardCard, DashboardEmptyState } from "@/shared/components/admin/DashboardUI";

export type NominationRankingRow = {
  id: string;
  place: number | null;
  competitorName: string;
  nominationName: string;
  categoryName: string;
  assignedJudgeCount: number;
  submittedJudgeCount: number;
  averageScore: number | null;
  status: string;
  hasFewerReviewsThanPeers: boolean;
  criteria: Array<{ key: string; label: string; maximum: number }>;
  reviews: Array<{
    id: string;
    juryName: string;
    totalScore: number | null;
    scores: Record<string, number | null>;
    comment: string | null;
    submittedAtLabel: string | null;
  }>;
};

function StatusPill({ status }: { status: string }) {
  return (
    <span className="inline-flex min-h-7 items-center rounded-full border border-[rgba(114,160,193,0.22)] bg-[var(--color-blue-wash)] px-3 text-[0.65rem] font-semibold text-[#356f98]">
      {adminT.scoring.rankingStatuses[status] ?? status}
    </span>
  );
}

export default function NominationRankingTable({ rows }: { rows: NominationRankingRow[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  if (rows.length === 0) {
    return (
      <DashboardCard>
        <DashboardEmptyState icon={<Trophy size={22} />} title={adminT.scoring.rankingEmptyTitle} description={adminT.scoring.rankingEmptyText} />
      </DashboardCard>
    );
  }

  function toggle(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <DashboardCard className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-[960px] w-full border-collapse text-left">
          <caption className="sr-only">{adminT.scoring.rankingsTitle}</caption>
          <thead className="bg-white/60 text-[0.62rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
            <tr>
              {[adminT.scoring.rankingPlace, adminT.scoring.competitor, adminT.scoring.nomination, adminT.scoring.submittedJuryScores, adminT.scoring.finalScore, adminT.scoring.rankingStatusColumn, ""].map((header, index) => (
                <th key={`${header}-${index}`} scope="col" className="border-b border-[rgba(37,42,45,0.08)] px-4 py-3">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(37,42,45,0.08)]">
            {rows.map((row) => {
              const open = expanded.has(row.id);
              return (
                <Fragment key={row.id}>
                <tr className="group">
                  <td className="px-4 py-4 align-top font-[var(--font-title-family)] text-2xl text-[var(--color-ink)]">{row.place ?? "—"}</td>
                  <td className="px-4 py-4 align-top">
                    <p className="font-medium text-[var(--color-ink)]">{row.competitorName}</p>
                    <p className="mt-1 text-xs text-[var(--color-ink-muted)]">{row.categoryName}</p>
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-[var(--color-ink-soft)]">{row.nominationName}</td>
                  <td className="px-4 py-4 align-top">
                    <p className="text-sm font-semibold text-[var(--color-ink)]">{adminT.scoring.submittedOutOfAssigned(row.submittedJudgeCount, row.assignedJudgeCount)}</p>
                    {row.hasFewerReviewsThanPeers ? (
                      <p className="mt-1 flex max-w-56 items-start gap-1.5 text-xs leading-5 text-amber-700"><AlertTriangle aria-hidden size={13} className="mt-0.5 shrink-0" />{adminT.scoring.fewerReviewsWarning}</p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 align-top font-[var(--font-title-family)] text-xl text-[var(--color-ink)]">{row.averageScore === null ? "—" : row.averageScore.toFixed(1)}</td>
                  <td className="px-4 py-4 align-top"><StatusPill status={row.status} /></td>
                  <td className="px-4 py-4 align-top text-right">
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={`ranking-breakdown-${row.id}`}
                      onClick={() => toggle(row.id)}
                      className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-xs font-semibold text-[var(--color-blue)] hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.2)]"
                    >
                      {open ? <ChevronUp aria-hidden size={15} /> : <ChevronDown aria-hidden size={15} />}
                      {open ? adminT.scoring.rankingCollapse : adminT.scoring.rankingBreakdown}
                    </button>
                  </td>
                </tr>
                  {open ? (
                    <tr><td id={`ranking-breakdown-${row.id}`} colSpan={7} className="p-0">
                      <div className="border-t border-[rgba(114,160,193,0.14)] bg-[var(--color-blue-wash)]/55 px-5 py-4">
                        <p className="text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">{adminT.scoring.juryScoreBreakdown}</p>
                        {row.reviews.length === 0 ? (
                          <p className="mt-3 text-sm text-[var(--color-ink-soft)]">{adminT.scoring.noOfficialScore}</p>
                        ) : (
                          <div className="mt-3 grid gap-3">
                            {row.reviews.map((review) => (
                              <article key={review.id} className="rounded-[20px] border border-[rgba(114,160,193,0.16)] bg-white/78 p-4">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <div><p className="text-sm font-semibold text-[var(--color-ink)]">{review.juryName}</p><p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">{review.submittedAtLabel}</p></div>
                                  <p className="font-[var(--font-title-family)] text-xl text-[var(--color-ink)]">{review.totalScore ?? "—"}</p>
                                </div>
                                <dl className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                                  {row.criteria.map((criterion) => (
                                    <div key={criterion.key} className="rounded-[14px] bg-white/80 px-3 py-2">
                                      <dt className="text-[0.68rem] leading-4 text-[var(--color-ink-muted)]">{criterion.label}</dt>
                                      <dd className="mt-1 text-sm font-semibold text-[var(--color-ink)]">{review.scores[criterion.key] ?? "—"} / {criterion.maximum}</dd>
                                    </div>
                                  ))}
                                </dl>
                                {review.comment ? <p className="mt-3 whitespace-pre-line text-sm leading-6 text-[var(--color-ink-soft)]">{review.comment}</p> : null}
                              </article>
                            ))}
                          </div>
                        )}
                      </div>
                    </td></tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </DashboardCard>
  );
}

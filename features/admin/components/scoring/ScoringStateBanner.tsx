import { CircleCheck, LockKeyhole } from "lucide-react";
import { adminT, formatAdminDateTime } from "@/lib/i18n/admin";
import type { ScoringState } from "@/features/jury/scoring/scoring-state";

export default function ScoringStateBanner({ state }: { state: ScoringState }) {
  const closed = state.status === "CLOSED";
  const Icon = closed ? LockKeyhole : CircleCheck;
  return (
    <section
      aria-live="polite"
      className={closed
        ? "flex items-start gap-3 rounded-[22px] border border-amber-200 bg-amber-50/90 px-4 py-3 text-amber-950 shadow-[0_12px_30px_rgba(120,80,20,0.06)]"
        : "flex items-center gap-3 rounded-[22px] border border-[rgba(114,160,193,0.22)] bg-[var(--color-blue-wash)] px-4 py-3 text-[var(--color-ink)]"
      }
    >
      <span className={closed ? "mt-0.5 text-amber-700" : "text-[var(--color-blue)]"}>
        <Icon aria-hidden size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold">
          {closed ? adminT.scoring.scoringClosed : adminT.scoring.scoringOpen}
        </p>
        {closed ? (
          <p className="mt-0.5 text-xs leading-5 text-amber-900/80">
            {adminT.scoring.scoringClosedDescription}
            {state.closedAt ? ` ${adminT.scoring.scoringClosedAt(formatAdminDateTime(state.closedAt))}` : ""}
          </p>
        ) : null}
      </div>
    </section>
  );
}

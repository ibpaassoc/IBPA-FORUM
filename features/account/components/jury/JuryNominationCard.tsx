import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock3, FilePenLine, UserRound } from "lucide-react";
import type { JuryNominationListItem } from "@/features/jury/server/reviews";

const statusPresentation = {
  NOT_STARTED: {
    label: "Not started",
    className: "border-[rgba(37,42,45,0.12)] bg-white/82 text-[var(--color-ink-soft)]",
    icon: Clock3,
  },
  IN_PROGRESS: {
    label: "Draft in progress",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    icon: FilePenLine,
  },
  COMPLETED: {
    label: "Completed",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
  },
  LOCKED: {
    label: "Completed · locked",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
  },
} as const;

function formatDate(value: Date | null) {
  if (!value) return "Date unavailable";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(value);
}

export default function JuryNominationCard({ nomination }: { nomination: JuryNominationListItem }) {
  const status = statusPresentation[nomination.reviewStatus];
  const StatusIcon = status.icon;
  const complete = nomination.reviewStatus === "COMPLETED" || nomination.reviewStatus === "LOCKED";

  return (
    <article className="group relative overflow-hidden rounded-[28px] border border-[rgba(114,160,193,0.18)] bg-white/78 p-4 shadow-[0_20px_65px_rgba(37,42,45,0.065)] backdrop-blur-2xl transition duration-300 hover:-translate-y-0.5 hover:border-[rgba(114,160,193,0.38)] hover:shadow-[0_24px_72px_rgba(114,160,193,0.14)] sm:p-5">
      <div className="pointer-events-none absolute -right-16 -top-20 size-44 rounded-full bg-[rgba(185,217,235,0.22)] blur-3xl" />
      <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.52fr)_auto] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex min-h-7 items-center gap-1.5 rounded-full border px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.1em] ${status.className}`}>
              <StatusIcon aria-hidden size={12} />{status.label}
            </span>
            <span className="rounded-full border border-[rgba(114,160,193,0.2)] bg-[var(--color-blue-wash)] px-3 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[#356f98]">{nomination.category.name}</span>
          </div>
          <h2 className="mt-3 font-[var(--font-title-family)] text-[clamp(1.35rem,3vw,1.75rem)] font-light leading-tight tracking-[-0.025em] text-[var(--color-ink)]">{nomination.award.name}</h2>
          <p className="mt-1 font-[var(--font-accent-family)] text-[0.95rem] italic text-[var(--color-ink-soft)]">Submitted {formatDate(nomination.submittedAt ?? nomination.createdAt)}</p>
        </div>

        <div className="rounded-[22px] border border-[rgba(37,42,45,0.08)] bg-white/68 p-4">
          <div className="flex items-center gap-2 text-[var(--color-blue)]">
            <UserRound aria-hidden size={14} />
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.14em]">Nominee</p>
          </div>
          <p className="mt-2 truncate font-[var(--font-title-family)] text-[1.08rem] font-light text-[var(--color-ink)]">{nomination.applicantName}</p>
          {complete && nomination.totalScore !== null ? (
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">Score {nomination.totalScore} / {nomination.maximumScore}</p>
          ) : (
            <p className="mt-1 text-xs text-[var(--color-ink-soft)]">One nomination · one review</p>
          )}
        </div>

        <Link
          href={`/account/jury/nominations/${nomination.id}`}
          aria-label={`${complete ? "View" : "Review"} ${nomination.award.name}`}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--color-blue)] px-5 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_14px_32px_rgba(114,160,193,0.25)] transition hover:bg-[#5f91b6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.28)]"
        >
          {complete ? "View review" : nomination.reviewStatus === "IN_PROGRESS" ? "Continue" : "Start review"}
          <ArrowRight aria-hidden size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}

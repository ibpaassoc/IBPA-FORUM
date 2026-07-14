import Link from "next/link";
import {
  Bell,
  ChevronRight,
  CirclePlus,
  Play,
  Ticket,
  UserRound,
} from "lucide-react";
import type { ComponentType, ReactNode } from "react";

type IconType = ComponentType<{ size?: number | string; className?: string; "aria-hidden"?: boolean }>;

function WidgetCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-[28px] border border-[rgba(114,160,193,0.2)] bg-white/78 p-5 shadow-[0_22px_70px_rgba(37,42,45,0.075)] backdrop-blur-2xl ${className}`}
    >
      {children}
    </section>
  );
}

function QuickActionRow({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: IconType;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-12 items-center justify-between gap-3 rounded-[18px] border-b border-[rgba(37,42,45,0.06)] px-2 text-sm text-[var(--color-ink)] transition last:border-b-0 hover:bg-[var(--color-blue-wash)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)]"
    >
      <span className="inline-flex min-w-0 items-center gap-3">
        <Icon aria-hidden size={16} className="shrink-0 text-[var(--color-blue)]" />
        <span className="truncate">{children}</span>
      </span>
      <ChevronRight
        aria-hidden
        size={15}
        className="shrink-0 text-[var(--color-ink-muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--color-blue)]"
      />
    </Link>
  );
}

export function QuickActionsCard({ latestNominationId }: { latestNominationId: string | null }) {
  return (
    <WidgetCard>
      <h2 className="font-[var(--font-title-family)] text-[1.4rem] font-light text-[var(--color-ink)]">
        Quick actions
      </h2>
      <nav aria-label="Quick actions" className="mt-3 flex flex-col">
        {latestNominationId ? (
          <QuickActionRow href={`/account/applicant/nominations/${latestNominationId}`} icon={Play}>
            Continue latest nomination
          </QuickActionRow>
        ) : null}
        <QuickActionRow href="/account/applicant/add-nomination" icon={CirclePlus}>
          Add nominations
        </QuickActionRow>
        <QuickActionRow href="/account/applicant/tickets" icon={Ticket}>
          Open tickets
        </QuickActionRow>
        <QuickActionRow href="/account/applicant/profile" icon={UserRound}>
          Edit profile
        </QuickActionRow>
      </nav>
    </WidgetCard>
  );
}

export function DeadlineCard({
  deadlineMonthLabel,
  deadlineDayLabel,
  daysRemaining,
  closed,
}: {
  deadlineMonthLabel: string;
  deadlineDayLabel: string;
  daysRemaining: number;
  closed: boolean;
}) {
  return (
    <WidgetCard>
      <p className="inline-flex items-center gap-2 text-[0.66rem] font-semibold uppercase tracking-[0.17em] text-[var(--color-ink-soft)]">
        <Bell aria-hidden size={13} className="text-[var(--color-blue)]" />
        Important reminder
      </p>
      <div className="mt-4 flex items-center gap-4">
        <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-[20px] border border-[rgba(114,160,193,0.22)] bg-white/85 shadow-[0_12px_30px_rgba(37,42,45,0.06)]">
          <span className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-blue)]">
            {deadlineMonthLabel}
          </span>
          <span className="font-[var(--font-title-family)] text-2xl font-light leading-none text-[var(--color-ink)]">
            {deadlineDayLabel}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--color-ink)]">
            {closed ? "Applications closed" : "Applications close"}
          </p>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
            {closed
              ? "Submitted nominations are read-only for judging."
              : `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining`}
          </p>
        </div>
      </div>
    </WidgetCard>
  );
}

export function SupportCard() {
  return (
    <section className="rounded-[28px] border border-[rgba(3,2,19,0.2)] bg-[linear-gradient(150deg,#1d2a3a,#0b1622)] p-5 text-white shadow-[0_24px_70px_rgba(3,2,19,0.28)]">
      <p className="font-[var(--font-title-family)] text-[1.3rem] font-light leading-snug">
        Thank you for being part of the IBPA community.
      </p>
      <p className="mt-2 text-sm leading-6 text-white/70">
        We can&apos;t wait to see your work. If anything is unclear, our team is happy to help.
      </p>
      <a
        href="mailto:forum-support@ibpassociations.org"
        className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/25"
      >
        Contact support
        <ChevronRight aria-hidden size={14} />
      </a>
    </section>
  );
}

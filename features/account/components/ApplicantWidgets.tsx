"use client";

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
import { useLanguage } from "@/lib/i18n/LanguageProvider";

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
  const { t } = useLanguage();
  const w = t.account.widgets;
  return (
    <WidgetCard>
      <h2 className="font-[var(--font-title-family)] text-[1.4rem] font-light text-[var(--color-ink)]">
        {w.quickActions}
      </h2>
      <nav aria-label={w.quickActions} className="mt-3 flex flex-col">
        {latestNominationId ? (
          <QuickActionRow href={`/account/applicant/nominations/${latestNominationId}`} icon={Play}>
            {w.continueLatest}
          </QuickActionRow>
        ) : null}
        <QuickActionRow href="/account/applicant/add-nomination" icon={CirclePlus}>
          {w.addNominations}
        </QuickActionRow>
        <QuickActionRow href="/account/applicant/tickets" icon={Ticket}>
          {w.openTickets}
        </QuickActionRow>
        <QuickActionRow href="/account/applicant/profile" icon={UserRound}>
          {w.editProfile}
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
  const { t } = useLanguage();
  const w = t.account.widgets;
  return (
    <WidgetCard>
      <p className="inline-flex items-center gap-2 text-[0.66rem] font-semibold uppercase tracking-[0.17em] text-[var(--color-ink-soft)]">
        <Bell aria-hidden size={13} className="text-[var(--color-blue)]" />
        {w.reminder}
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
            {closed ? w.closed : w.close}
          </p>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
            {closed ? w.closedText : `${w.daysRemainingLabel} ${daysRemaining}`}
          </p>
        </div>
      </div>
    </WidgetCard>
  );
}

export function SupportCard() {
  const { t } = useLanguage();
  const w = t.account.widgets;
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[rgba(114,160,193,0.26)] bg-[var(--color-blue-wash)]/90 p-5 shadow-[0_22px_70px_rgba(114,160,193,0.16)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute -right-14 -top-16 size-40 rounded-full bg-[rgba(185,217,235,0.5)] blur-2xl" />
      <div className="relative">
        <p className="font-[var(--font-title-family)] text-[1.3rem] font-light leading-snug text-[var(--color-ink)]">
          {w.supportTitle}
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--color-ink-soft)]">{w.supportText}</p>
        <a
          href="mailto:forum-support@ibpassociations.org"
          className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-[rgba(114,160,193,0.3)] bg-white/78 px-4 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink)] transition hover:-translate-y-0.5 hover:border-[var(--color-blue)] hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.3)]"
        >
          {w.contactSupport}
          <ChevronRight aria-hidden size={14} />
        </a>
      </div>
    </section>
  );
}

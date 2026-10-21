"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Search } from "lucide-react";
import type { MailingRecipientGroup } from "@/features/admin/lib/mailing";
import {
  DEFAULT_MAILING_FILTERS,
  GROUP_FILTERS,
  recipientMatches,
  type MailingFilters,
} from "@/features/admin/lib/mailing-filters";
import type { MailingRecipient } from "@/features/admin/server/mailing";
import {
  DashboardCard,
  DashboardSecondaryBtn,
  StatusBadge,
  dashboardInputClass,
  dashboardSelectClass,
} from "@/shared/components/admin/DashboardUI";
import {
  GROUP_META,
  GROUP_ORDER,
  recipientInitials,
  type RecipientSendState,
  type RecipientSendStatuses,
} from "./mailing-recipient-meta";

const PAGE_SIZE = 60;

type Tone = "green" | "red" | "amber" | "blue" | "neutral";

function RecipientBadges({ recipient }: { recipient: MailingRecipient }) {
  if (recipient.ticket) {
    const { ticket } = recipient;
    return (
      <>
        <StatusBadge tone={ticket.source === "ADMIN" ? "blue" : "green"}>
          {ticket.source === "ADMIN" ? "Админ" : "Оплачен"}
        </StatusBadge>
        <StatusBadge>{ticket.label}</StatusBadge>
        {ticket.checkedIn ? <StatusBadge tone="amber">Check-in</StatusBadge> : null}
      </>
    );
  }

  const state = recipient.registrationState;
  const tone: Tone =
    state?.key === "registered" ? "green" : state?.key === "disabled" ? "red" : "amber";
  const percent = recipient.completionPercentage;

  return (
    <>
      {state ? <StatusBadge tone={tone}>{state.label}</StatusBadge> : null}
      {percent !== null ? (
        <span
          className="flex items-center gap-2"
          title={
            recipient.nominationCount === 0
              ? "Нет номинаций"
              : `Заполнение · номинаций: ${recipient.nominationCount}`
          }
        >
          <span className="h-1.5 w-14 overflow-hidden rounded-full bg-[rgba(3,2,19,0.08)]">
            <span
              className="block h-full rounded-full bg-[var(--color-blue)]"
              style={{ width: `${Math.min(100, percent)}%` }}
            />
          </span>
          <span className="w-9 text-right text-xs font-semibold tabular-nums text-[var(--color-ink-soft)]">
            {percent}%
          </span>
        </span>
      ) : null}
    </>
  );
}

function SendStateBadge({ status }: { status: RecipientSendState }) {
  if (status.state === "sent") {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
        <CheckCircle2 size={14} /> Отправлено
      </span>
    );
  }
  if (status.state === "failed") {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs font-semibold text-red-700"
        title={status.reason}
      >
        <AlertCircle size={14} /> Ошибка
      </span>
    );
  }
  return (
    <span
      className="text-xs font-semibold text-[var(--color-ink-soft)]"
      title={status.reason}
    >
      {status.state === "duplicate" ? "Дубликат адреса" : "Пропущено"}
    </span>
  );
}

const RecipientRow = memo(function RecipientRow({
  recipient,
  checked,
  locked,
  status,
  onToggle,
}: {
  recipient: MailingRecipient;
  checked: boolean;
  locked: boolean;
  status: RecipientSendState | undefined;
  onToggle: (ref: string) => void;
}) {
  const meta = GROUP_META[recipient.group];
  const disabled = !recipient.selectable || locked;

  return (
    <label
      className={`flex items-center gap-3 px-3 py-2.5 transition sm:px-4 ${
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      } ${recipient.selectable ? "" : "opacity-55"} ${
        checked
          ? "bg-[var(--color-blue-wash)]"
          : "hover:bg-[var(--color-blue-wash)]/55"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={() => onToggle(recipient.ref)}
        className="size-4 shrink-0 accent-[var(--color-blue)]"
        aria-label={`Выбрать ${recipient.fullName}`}
      />
      <span
        aria-hidden
        className={`hidden size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold sm:flex ${meta.avatarClass}`}
      >
        {recipientInitials(recipient.fullName)}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-[var(--color-ink)]">
          {recipient.fullName}
        </span>
        <span className="block truncate text-xs text-[var(--color-ink-soft)]">
          {recipient.email}
        </span>
        <span className="mt-1.5 flex flex-wrap items-center gap-1.5 md:hidden">
          <RecipientBadges recipient={recipient} />
        </span>
      </span>
      <span className="hidden shrink-0 items-center justify-end gap-2 md:flex">
        <RecipientBadges recipient={recipient} />
      </span>
      {status ? (
        <span className="shrink-0">
          <SendStateBadge status={status} />
        </span>
      ) : null}
    </label>
  );
});

function SelectAllCheckbox({
  total,
  selectedCount,
  disabled,
  onChange,
}: {
  total: number;
  selectedCount: number;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const all = total > 0 && selectedCount === total;

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = selectedCount > 0 && !all;
  }, [selectedCount, all]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={all}
      disabled={disabled || total === 0}
      onChange={(event) => onChange(event.target.checked)}
      className="size-4 shrink-0 accent-[var(--color-blue)]"
      aria-label="Выбрать всех показанных"
    />
  );
}

export default function MailingRecipientPicker({
  groups,
  selected,
  statuses,
  locked,
  onToggle,
  onSelectMany,
}: {
  groups: Record<MailingRecipientGroup, MailingRecipient[]>;
  selected: Set<string>;
  statuses: RecipientSendStatuses;
  locked: boolean;
  onToggle: (ref: string) => void;
  onSelectMany: (refs: string[], checked: boolean) => void;
}) {
  const [activeGroup, setActiveGroup] = useState<MailingRecipientGroup>("APPLICANT");
  const [filters, setFilters] = useState<Record<MailingRecipientGroup, MailingFilters>>({
    APPLICANT: DEFAULT_MAILING_FILTERS,
    JURY: DEFAULT_MAILING_FILTERS,
    TICKET: DEFAULT_MAILING_FILTERS,
  });
  const [search, setSearch] = useState("");
  const [limits, setLimits] = useState<Record<MailingRecipientGroup, number>>({
    APPLICANT: PAGE_SIZE,
    JURY: PAGE_SIZE,
    TICKET: PAGE_SIZE,
  });

  const active = filters[activeGroup];
  const config = GROUP_FILTERS[activeGroup];
  const meta = GROUP_META[activeGroup];

  const visible = useMemo(() => {
    const effective = { ...active, search };
    return groups[activeGroup].filter((recipient) =>
      recipientMatches(recipient, effective),
    );
  }, [groups, activeGroup, active, search]);

  const selectableVisible = useMemo(
    () => visible.filter((recipient) => recipient.selectable),
    [visible],
  );
  const selectedVisible = selectableVisible.filter((recipient) =>
    selected.has(recipient.ref),
  ).length;

  const limit = limits[activeGroup];
  const shown = visible.slice(0, limit);

  function patchFilters(patch: Partial<MailingFilters>) {
    setFilters((current) => ({
      ...current,
      [activeGroup]: { ...current[activeGroup], ...patch },
    }));
    setLimits((current) => ({ ...current, [activeGroup]: PAGE_SIZE }));
  }

  const selectedPerGroup = useMemo(() => {
    const counts: Record<MailingRecipientGroup, number> = {
      APPLICANT: 0,
      JURY: 0,
      TICKET: 0,
    };
    for (const group of GROUP_ORDER) {
      counts[group] = groups[group].filter((recipient) =>
        selected.has(recipient.ref),
      ).length;
    }
    return counts;
  }, [groups, selected]);

  return (
    <DashboardCard className="flex flex-col gap-4 p-0!">
      <div className="flex flex-col gap-4 p-4 pb-0 md:p-5 md:pb-0">
        <div
          role="tablist"
          aria-label="Тип получателей"
          className="grid grid-cols-3 gap-1.5 rounded-[22px] border border-[rgba(114,160,193,0.16)] bg-white/62 p-1.5"
        >
          {GROUP_ORDER.map((group) => {
            const groupMeta = GROUP_META[group];
            const Icon = groupMeta.icon;
            const isActive = group === activeGroup;
            return (
              <button
                key={group}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveGroup(group)}
                className={`flex min-h-12 items-center justify-center gap-2 rounded-[17px] px-2 py-1.5 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.22)] ${
                  isActive
                    ? "bg-[var(--color-blue)] text-white shadow-[0_10px_22px_rgba(114,160,193,0.26)]"
                    : "text-[var(--color-ink-soft)] hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)]"
                }`}
              >
                <Icon aria-hidden size={16} className="hidden shrink-0 sm:block" />
                <span className="min-w-0 text-center sm:text-left">
                  <span className="block truncate text-[0.7rem] font-semibold uppercase tracking-[0.1em]">
                    {groupMeta.label}
                  </span>
                  <span
                    className={`block text-xs tabular-nums ${
                      isActive ? "text-white/85" : "text-[var(--color-ink-soft)]"
                    }`}
                  >
                    {selectedPerGroup[group] > 0
                      ? `${selectedPerGroup[group]} из ${groups[group].length}`
                      : groups[group].length}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-sm text-[var(--color-ink-soft)]">{meta.description}</p>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_repeat(2,minmax(0,170px))]">
          <label className="relative block sm:col-span-2 lg:col-span-1">
            <span className="sr-only">Поиск получателя</span>
            <Search
              aria-hidden
              size={16}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-ink-soft)]"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setLimits({ APPLICANT: PAGE_SIZE, JURY: PAGE_SIZE, TICKET: PAGE_SIZE });
              }}
              placeholder="Имя или email"
              className={`${dashboardInputClass} pl-11`}
            />
          </label>
          {config.primary ? (
            <select
              aria-label={config.primary.label}
              value={active.primary}
              onChange={(event) => patchFilters({ primary: event.target.value })}
              className={dashboardSelectClass}
            >
              {config.primary.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {config.primary!.label}: {option.label}
                </option>
              ))}
            </select>
          ) : null}
          {config.secondary ? (
            <select
              aria-label={config.secondary.label}
              value={active.secondary}
              onChange={(event) => patchFilters({ secondary: event.target.value })}
              className={dashboardSelectClass}
            >
              {config.secondary.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {config.secondary!.label}: {option.label}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      </div>

      <div className="border-t border-[rgba(114,160,193,0.16)]">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 bg-white/50 px-3 py-2 sm:px-4">
          <SelectAllCheckbox
            total={selectableVisible.length}
            selectedCount={selectedVisible}
            disabled={locked}
            onChange={(checked) =>
              onSelectMany(
                selectableVisible.map((recipient) => recipient.ref),
                checked,
              )
            }
          />
          <p className="min-w-0 flex-1 text-xs text-[var(--color-ink-soft)]">
            Показано {visible.length} из {groups[activeGroup].length}
            {selectedVisible > 0 ? ` · выбрано ${selectedVisible}` : ""}
          </p>
          {activeGroup === "APPLICANT" ? (
            <DashboardSecondaryBtn
              className="min-h-9! px-4!"
              disabled={locked}
              onClick={() =>
                onSelectMany(
                  selectableVisible
                    .filter((recipient) => (recipient.completionPercentage ?? 0) < 100)
                    .map((recipient) => recipient.ref),
                  true,
                )
              }
            >
              + Незавершённые
            </DashboardSecondaryBtn>
          ) : null}
        </div>

        <div
          role="group"
          aria-label={`Список: ${meta.label}`}
          className="max-h-[min(62vh,640px)] min-h-[200px] divide-y divide-[rgba(114,160,193,0.12)] overflow-y-auto overscroll-contain"
        >
          {shown.length > 0 ? (
            shown.map((recipient) => (
              <RecipientRow
                key={recipient.ref}
                recipient={recipient}
                checked={selected.has(recipient.ref)}
                locked={locked}
                status={statuses[recipient.ref]}
                onToggle={onToggle}
              />
            ))
          ) : (
            <p className="px-4 py-12 text-center text-sm text-[var(--color-ink-soft)]">
              {meta.emptyText}
            </p>
          )}
          {visible.length > shown.length ? (
            <div className="flex justify-center p-3">
              <DashboardSecondaryBtn
                className="min-h-9!"
                onClick={() =>
                  setLimits((current) => ({
                    ...current,
                    [activeGroup]: current[activeGroup] + PAGE_SIZE,
                  }))
                }
              >
                Показать ещё ({visible.length - shown.length})
              </DashboardSecondaryBtn>
            </div>
          ) : null}
        </div>
      </div>
    </DashboardCard>
  );
}

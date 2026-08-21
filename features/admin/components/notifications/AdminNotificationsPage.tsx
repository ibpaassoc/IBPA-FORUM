"use client";

import { useActionState, useMemo, useState } from "react";
import {
  BellRing,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Search,
  Send,
  Sparkles,
  TicketCheck,
  Users,
} from "lucide-react";
import {
  createNotificationsAction,
  type CreateNotificationsState,
} from "@/features/notifications/actions/admin.actions";
import {
  JURY_GALA_CONTENT,
  parseNotificationContent,
  SPECIAL_OFFER_CONTENT,
  type NotificationKind,
} from "@/features/notifications/lib/content";
import type { NotificationRecipient } from "@/features/notifications/server/admin";
import {
  DashboardCard,
  DashboardHeader,
  DashboardMetricTile,
  DashboardPanel,
  DashboardPrimaryBtn,
  DashboardSecondaryBtn,
  SearchBar,
  StatusBadge,
} from "@/shared/components/admin/DashboardUI";

const initialState: CreateNotificationsState = { status: "idle" };

type RecentNotification = {
  id: string;
  name: string;
  email: string;
  type: "JURY" | "APPLICANT";
  content: unknown;
  isViewed: boolean;
  dateCreated: Date;
};

const KIND_META = {
  JURY_GALA: {
    optionLabel: "Гала-ужин",
    recipientLabel: "Активное жюри",
    shortAudience: "Жюри",
    title: "Бесплатный гала-ужин",
    description: "Приглашение с подтверждением и отдельным QR только для гала-ужина.",
    content: JURY_GALA_CONTENT,
    icon: Sparkles,
    tone: "purple" as const,
  },
  SPECIAL_OFFER_2_DAYS: {
    optionLabel: "Приглашение на 2 дня",
    recipientLabel: "Активные заявители",
    shortAudience: "Заявители",
    title: "Спеццена на 2 дня форума",
    description: "Приватная покупка двухдневного пропуска с новым QR после оплаты.",
    content: SPECIAL_OFFER_CONTENT,
    icon: TicketCheck,
    tone: "blue" as const,
  },
} satisfies Record<NotificationKind, object>;

function notificationMeta(value: unknown) {
  const parsed = parseNotificationContent(value);
  return KIND_META[parsed.kind];
}

function RecipientAvatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[0.68rem] font-semibold uppercase text-[var(--color-blue)]">
      {initials || "IB"}
    </span>
  );
}

function NotificationTypeOption({
  kind,
  active,
  count,
  onSelect,
}: {
  kind: NotificationKind;
  active: boolean;
  count: number;
  onSelect: () => void;
}) {
  const meta = KIND_META[kind];
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      className={`flex w-full items-center gap-3 rounded-[20px] border p-3 text-left transition ${
        active
          ? "border-[rgba(114,160,193,0.42)] bg-[var(--color-blue-wash)] shadow-[0_12px_28px_rgba(114,160,193,0.12)]"
          : "border-[rgba(37,42,45,0.08)] bg-white/58 hover:border-[rgba(114,160,193,0.28)] hover:bg-white/78"
      }`}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-[var(--color-blue)] shadow-sm">
        <Icon size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-[var(--color-ink)]">{meta.optionLabel}</span>
        <span className="mt-0.5 block text-xs text-[var(--color-ink-soft)]">{count} получателей</span>
      </span>
      <ChevronRight size={15} className="shrink-0 text-[var(--color-ink-muted)]" />
    </button>
  );
}

export default function AdminNotificationsPage({
  jury,
  applicants,
  recent,
}: {
  jury: NotificationRecipient[];
  applicants: NotificationRecipient[];
  recent: RecentNotification[];
}) {
  const [state, action, pending] = useActionState(createNotificationsAction, initialState);
  const [activeKind, setActiveKind] = useState<NotificationKind>("SPECIAL_OFFER_2_DAYS");
  const [search, setSearch] = useState("");
  const [selectedByKind, setSelectedByKind] = useState<Record<NotificationKind, Set<string>>>(
    () => ({ JURY_GALA: new Set(), SPECIAL_OFFER_2_DAYS: new Set() }),
  );

  const viewed = recent.filter((item) => item.isViewed).length;
  const recipients = activeKind === "JURY_GALA" ? jury : applicants;
  const selected = selectedByKind[activeKind];
  const meta = KIND_META[activeKind];
  const preview = meta.content.copy.ru;
  const visible = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("ru-RU");
    return recipients.filter(
      (recipient) =>
        !query ||
        recipient.fullName.toLocaleLowerCase("ru-RU").includes(query) ||
        recipient.email.toLocaleLowerCase("ru-RU").includes(query),
    );
  }, [recipients, search]);

  function selectKind(kind: NotificationKind) {
    setActiveKind(kind);
    setSearch("");
  }

  function updateSelected(update: (current: Set<string>) => Set<string>) {
    setSelectedByKind((current) => ({ ...current, [activeKind]: update(current[activeKind]) }));
  }

  function toggleRecipient(id: string) {
    updateSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <DashboardHeader
        label="Коммуникации"
        title="Уведомления аккаунтов"
        description="Выберите сценарий, получателей и отправьте уведомление в личный кабинет."
        actions={
          <DashboardPrimaryBtn
            onClick={() => document.getElementById("notification-composer")?.scrollIntoView({ behavior: "smooth" })}
          >
            <Send size={16} /> Создать уведомление
          </DashboardPrimaryBtn>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <DashboardMetricTile label="Последние уведомления" value={recent.length} detail="отправлено" icon={BellRing} accent="blue" />
        <DashboardMetricTile label="Активное жюри" value={jury.length} detail="пользователей" icon={Users} accent="purple" />
        <DashboardMetricTile label="Активные заявители" value={applicants.length} detail="пользователей" icon={Users} accent="blue" />
        <DashboardMetricTile label="Просмотрено из последних" value={viewed} detail="просмотров" icon={CheckCircle2} accent="green" />
      </div>

      <form id="notification-composer" action={action}>
        <input type="hidden" name="kind" value={activeKind} />
        {[...selected].map((id) => <input key={id} type="hidden" name="accountIds" value={id} />)}

        <DashboardCard className="overflow-hidden p-0 md:p-0">
          <div className="grid min-h-[40rem] xl:grid-cols-[15rem_minmax(0,1fr)_21rem]">
            <aside className="border-b border-[rgba(37,42,45,0.08)] p-4 xl:border-b-0 xl:border-r xl:p-5">
              <h2 className="font-[var(--font-title-family)] text-2xl font-light">Тип уведомления</h2>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                <NotificationTypeOption kind="SPECIAL_OFFER_2_DAYS" active={activeKind === "SPECIAL_OFFER_2_DAYS"} count={applicants.length} onSelect={() => selectKind("SPECIAL_OFFER_2_DAYS")} />
                <NotificationTypeOption kind="JURY_GALA" active={activeKind === "JURY_GALA"} count={jury.length} onSelect={() => selectKind("JURY_GALA")} />
              </div>
            </aside>

            <section className="min-w-0 border-b border-[rgba(37,42,45,0.08)] p-4 xl:border-b-0 xl:border-r xl:p-5">
              <div className="grid grid-cols-2 rounded-[22px] border border-[rgba(114,160,193,0.18)] bg-white/58 p-1">
                {(["SPECIAL_OFFER_2_DAYS", "JURY_GALA"] as NotificationKind[]).map((kind) => (
                  <button
                    key={kind}
                    type="button"
                    onClick={() => selectKind(kind)}
                    className={`flex min-h-11 items-center justify-center gap-2 rounded-[18px] px-3 text-xs font-semibold transition ${
                      activeKind === kind
                        ? "bg-white text-[var(--color-blue)] shadow-[0_8px_22px_rgba(37,42,45,0.08)] ring-1 ring-[rgba(114,160,193,0.24)]"
                        : "text-[var(--color-ink-soft)] hover:bg-white/60"
                    }`}
                  >
                    {KIND_META[kind].optionLabel}
                    <span className="rounded-full bg-[var(--color-blue-wash)] px-2 py-0.5 text-[0.62rem] text-[var(--color-blue)]">
                      {kind === "JURY_GALA" ? jury.length : applicants.length}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                <SearchBar value={search} onChange={setSearch} placeholder="Поиск по имени или email" className="min-w-0 flex-1" />
                <div className="flex gap-2">
                  <DashboardSecondaryBtn onClick={() => updateSelected((current) => new Set([...current, ...visible.map((item) => item.id)]))}>
                    Выбрать всех
                  </DashboardSecondaryBtn>
                  <DashboardSecondaryBtn onClick={() => updateSelected(() => new Set())}>Очистить</DashboardSecondaryBtn>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 text-xs text-[var(--color-ink-soft)]">
                <span>Получатели: {meta.recipientLabel}</span>
                <strong className="shrink-0 font-semibold text-[var(--color-ink)]">Выбрано: {selected.size}</strong>
              </div>

              <div className="mt-4 max-h-[29rem] space-y-2 overflow-y-auto pr-1">
                {visible.length === 0 ? (
                  <DashboardPanel><p className="py-8 text-center text-sm text-[var(--color-ink-soft)]">Получатели не найдены.</p></DashboardPanel>
                ) : (
                  visible.map((recipient) => {
                    const checked = selected.has(recipient.id);
                    return (
                      <label
                        key={recipient.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-[18px] border p-3 transition ${
                          checked
                            ? "border-[rgba(114,160,193,0.48)] bg-[var(--color-blue-wash)]/80 shadow-[0_8px_22px_rgba(114,160,193,0.1)]"
                            : "border-[rgba(37,42,45,0.08)] bg-white/48 hover:border-[rgba(114,160,193,0.28)] hover:bg-white/72"
                        }`}
                      >
                        <input type="checkbox" checked={checked} onChange={() => toggleRecipient(recipient.id)} className="size-4 shrink-0 accent-[var(--color-blue)]" />
                        <RecipientAvatar name={recipient.fullName} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-[var(--color-ink)]">{recipient.fullName}</span>
                          <span className="mt-0.5 block truncate text-xs text-[var(--color-ink-soft)]">{recipient.email}</span>
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </section>

            <aside className="bg-[var(--color-blue-wash)]/28 p-4 xl:p-5">
              <h2 className="font-[var(--font-title-family)] text-2xl font-light">Предпросмотр</h2>
              <div className="mt-4 flex items-center gap-3 rounded-[18px] border border-[rgba(114,160,193,0.2)] bg-white/72 p-3">
                  <span className="flex size-9 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[var(--color-blue)]"><meta.icon size={16} /></span>
                  <div><p className="text-sm font-semibold text-[var(--color-ink)]">{meta.optionLabel}</p><p className="mt-0.5 text-xs text-[var(--color-ink-soft)]">{meta.recipientLabel}</p></div>
              </div>

              <div className="mt-4 rounded-[22px] border border-[rgba(114,160,193,0.18)] bg-[var(--color-blue-wash)]/54 p-3">
                <div className="rounded-[18px] border border-[rgba(37,42,45,0.08)] bg-white p-4 shadow-[0_12px_30px_rgba(37,42,45,0.05)]">
                  <div className="flex items-center justify-between gap-3 text-[0.62rem] uppercase tracking-[0.12em] text-[var(--color-ink-soft)]"><strong className="font-semibold text-[var(--color-ink)]">IBPA</strong><span>сейчас</span></div>
                  <h3 className="mt-4 font-[var(--font-title-family)] text-xl font-light leading-tight">{preview.title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-5 text-[var(--color-ink)]">{preview.summary}</p>
                  <p className="mt-2 text-xs leading-5 text-[var(--color-ink-soft)]">{preview.description}</p>
                  <span className="mt-4 inline-flex rounded-full bg-[var(--color-blue)] px-4 py-2 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-white">{preview.actionLabel}</span>
                </div>
              </div>

              <div className="mt-4 rounded-[20px] border border-[rgba(37,42,45,0.08)] bg-white/68 p-4">
                <div className="flex items-center justify-between gap-3"><h3 className="font-[var(--font-title-family)] text-lg font-light">Получатели</h3><strong className="text-sm font-semibold text-[var(--color-blue)]">{selected.size}</strong></div>
                <p className="mt-2 text-xs text-[var(--color-ink-soft)]">{meta.recipientLabel}</p>
              </div>

              <div aria-live="polite" className="mt-4 min-h-5 text-sm">
                {state.message ? <span className={state.status === "error" ? "text-red-700" : "text-emerald-700"}>{state.message}</span> : null}
              </div>
              <DashboardPrimaryBtn type="submit" disabled={pending || selected.size === 0} className="mt-2 w-full">
                {pending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />} Отправить уведомление
              </DashboardPrimaryBtn>
            </aside>
          </div>
        </DashboardCard>
      </form>

      <DashboardCard className="p-0 md:p-0">
        <div className="flex items-center gap-3 border-b border-[rgba(37,42,45,0.08)] px-4 py-4 md:px-5">
          <span className="flex size-9 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[var(--color-blue)]"><Search size={16} /></span>
          <div><p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-blue)]">Журнал</p><h2 className="font-[var(--font-title-family)] text-2xl font-light">Последние созданные</h2></div>
        </div>

        {recent.length === 0 ? (
          <div className="flex min-h-44 flex-col items-center justify-center gap-2 p-6 text-center text-[var(--color-ink-soft)]"><BellRing size={22} className="text-[var(--color-blue)]" /><p className="text-sm">Уведомлений пока нет.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[1.4fr_1fr_1.35fr_0.7fr_1fr] gap-4 border-b border-[rgba(37,42,45,0.08)] bg-white/38 px-5 py-3 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
                <span>Уведомление</span><span>Аудитория</span><span>Получатель</span><span>Просмотр</span><span>Создано</span>
              </div>
              {recent.map((item) => {
                const itemMeta = notificationMeta(item.content);
                return (
                  <div key={item.id} className="grid grid-cols-[1.4fr_1fr_1.35fr_0.7fr_1fr] items-center gap-4 border-b border-[rgba(37,42,45,0.07)] px-5 py-4 text-sm last:border-b-0">
                    <div className="min-w-0"><p className="truncate font-semibold text-[var(--color-ink)]">{itemMeta.title}</p><p className="mt-0.5 truncate text-xs text-[var(--color-ink-soft)]">{itemMeta.content.copy.ru.title}</p></div>
                    <StatusBadge tone={itemMeta.tone}>{itemMeta.shortAudience}</StatusBadge>
                    <div className="min-w-0"><p className="truncate font-semibold text-[var(--color-ink)]">{item.name}</p><p className="mt-0.5 truncate text-xs text-[var(--color-ink-soft)]">{item.email}</p></div>
                    <StatusBadge tone={item.isViewed ? "green" : "amber"}>{item.isViewed ? "Да" : "Нет"}</StatusBadge>
                    <span className="text-xs text-[var(--color-ink-soft)]">{new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.dateCreated))}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DashboardCard>
    </div>
  );
}

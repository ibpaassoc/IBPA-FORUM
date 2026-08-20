"use client";

import { useActionState, useMemo, useState } from "react";
import { BellRing, CheckCircle2, Loader2, Search, Sparkles, Users } from "lucide-react";
import {
  createNotificationsAction,
  type CreateNotificationsState,
} from "@/features/notifications/actions/admin.actions";
import { parseNotificationContent, type NotificationKind } from "@/features/notifications/lib/content";
import type { NotificationRecipient } from "@/features/notifications/server/admin";
import {
  DashboardAccentBlock,
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

function kindLabel(value: unknown) {
  const parsed = parseNotificationContent(value);
  return parsed.kind === "JURY_GALA" ? "Гала-ужин для жюри" : "Спецпредложение · 2 дня";
}

function RecipientComposer({
  kind,
  recipients,
}: {
  kind: NotificationKind;
  recipients: NotificationRecipient[];
}) {
  const [state, action, pending] = useActionState(createNotificationsAction, initialState);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [search, setSearch] = useState("");
  const isGala = kind === "JURY_GALA";
  const visible = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("ru-RU");
    return recipients.filter(
      (recipient) =>
        !query ||
        recipient.fullName.toLocaleLowerCase("ru-RU").includes(query) ||
        recipient.email.toLocaleLowerCase("ru-RU").includes(query),
    );
  }, [recipients, search]);

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <form action={action}>
      <input type="hidden" name="kind" value={kind} />
      <DashboardCard className="h-full">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[var(--color-blue)]">
              {isGala ? <Sparkles size={19} /> : <BellRing size={19} />}
            </span>
            <div>
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-blue)]">
                {isGala ? "Активное жюри" : "Активные заявители"}
              </p>
              <h2 className="mt-1 font-[var(--font-title-family)] text-2xl font-light leading-tight">
                {isGala ? "Бесплатный гала-ужин" : "Спеццена на 2 дня форума"}
              </h2>
            </div>
          </div>
          <StatusBadge tone={isGala ? "purple" : "blue"}>{recipients.length} доступно</StatusBadge>
        </div>

        <p className="mt-4 text-sm leading-6 text-[var(--color-ink-soft)]">
          {isGala
            ? "Получатель подтвердит участие чекбоксом. После подтверждения система выпустит отдельный QR только для гала-ужина и отправит его по email."
            : "Получатель перейдёт в приватную оплату. После оплаты будет выпущен новый двухдневный QR, отмеченный как специальное предложение."}
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Поиск по имени или email"
            className="min-w-0 flex-1"
          />
          <div className="flex gap-2">
            <DashboardSecondaryBtn
              onClick={() =>
                setSelected((current) => new Set([...current, ...visible.map((item) => item.id)]))
              }
            >
              Выбрать всех
            </DashboardSecondaryBtn>
            <DashboardSecondaryBtn onClick={() => setSelected(new Set())}>
              Очистить
            </DashboardSecondaryBtn>
          </div>
        </div>

        <div className="mt-4 max-h-[26rem] space-y-2 overflow-y-auto pr-1">
          {visible.length === 0 ? (
            <DashboardPanel>
              <p className="py-5 text-center text-sm text-[var(--color-ink-soft)]">
                Получатели не найдены.
              </p>
            </DashboardPanel>
          ) : (
            visible.map((recipient) => {
              const checked = selected.has(recipient.id);
              return (
                <label
                  key={recipient.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-[20px] border p-3.5 transition ${
                    checked
                      ? "border-[rgba(114,160,193,0.5)] bg-[var(--color-blue-wash)]/85"
                      : "border-[rgba(37,42,45,0.08)] bg-white/58 hover:border-[rgba(114,160,193,0.28)]"
                  }`}
                >
                  <input
                    type="checkbox"
                    name="accountIds"
                    value={recipient.id}
                    checked={checked}
                    onChange={() => toggle(recipient.id)}
                    className="mt-1 size-4 shrink-0 accent-[var(--color-blue)]"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-[var(--color-ink)]">
                      {recipient.fullName}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-[var(--color-ink-soft)]">
                      {recipient.email}
                    </span>
                  </span>
                </label>
              );
            })
          )}
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-[rgba(37,42,45,0.08)] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div aria-live="polite" className="min-h-5 text-sm">
            {state.message ? (
              <span className={state.status === "error" ? "text-red-700" : "text-emerald-700"}>
                {state.message}
              </span>
            ) : (
              <span className="text-[var(--color-ink-soft)]">Выбрано: {selected.size}</span>
            )}
          </div>
          <DashboardPrimaryBtn type="submit" disabled={pending || selected.size === 0}>
            {pending ? <Loader2 className="animate-spin" size={16} /> : <BellRing size={16} />}
            Создать уведомления
          </DashboardPrimaryBtn>
        </div>
      </DashboardCard>
    </form>
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
  const viewed = recent.filter((item) => item.isViewed).length;

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        label="Коммуникации"
        title="Уведомления аккаунтов"
        description="Создавайте интерактивные сообщения для активных аккаунтов. Уведомления появляются на отдельной странице, в обзоре и во всплывающем окне."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <DashboardAccentBlock>
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
            Последние уведомления
          </p>
          <p className="mt-3 font-[var(--font-title-family)] text-4xl font-light">{recent.length}</p>
        </DashboardAccentBlock>
        <DashboardMetricTile label="Активное жюри" value={jury.length} icon={Users} accent="purple" />
        <DashboardMetricTile label="Активные заявители" value={applicants.length} icon={Users} accent="blue" />
        <DashboardMetricTile label="Просмотрено из последних" value={viewed} icon={CheckCircle2} accent="green" />
      </div>

      <div className="grid gap-4 2xl:grid-cols-2">
        <RecipientComposer kind="JURY_GALA" recipients={jury} />
        <RecipientComposer kind="SPECIAL_OFFER_2_DAYS" recipients={applicants} />
      </div>

      <DashboardCard>
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[var(--color-blue)]">
            <Search size={18} />
          </span>
          <div>
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-blue)]">
              Журнал
            </p>
            <h2 className="font-[var(--font-title-family)] text-2xl font-light">Последние созданные</h2>
          </div>
        </div>

        <div className="mt-5 grid gap-2">
          {recent.length === 0 ? (
            <DashboardPanel>
              <p className="py-6 text-center text-sm text-[var(--color-ink-soft)]">Уведомлений пока нет.</p>
            </DashboardPanel>
          ) : (
            recent.map((item) => (
              <DashboardPanel key={item.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--color-ink)]">{item.name}</p>
                  <p className="mt-0.5 truncate text-xs text-[var(--color-ink-soft)]">{item.email}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <StatusBadge tone={item.type === "JURY" ? "purple" : "blue"}>{kindLabel(item.content)}</StatusBadge>
                  <StatusBadge tone={item.isViewed ? "green" : "amber"}>
                    {item.isViewed ? "Просмотрено" : "Новое"}
                  </StatusBadge>
                  <span className="text-xs text-[var(--color-ink-soft)]">
                    {new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.dateCreated))}
                  </span>
                </div>
              </DashboardPanel>
            ))
          )}
        </div>
      </DashboardCard>
    </div>
  );
}

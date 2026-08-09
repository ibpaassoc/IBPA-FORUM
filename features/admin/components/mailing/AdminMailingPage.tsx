"use client";

import { useActionState, useMemo, useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Mail,
  Search,
  Send,
  UserRoundCheck,
  Users,
} from "lucide-react";
import {
  type MailingActionState,
  sendMailingAction,
} from "@/features/admin/actions/mailing.actions";
import {
  DEFAULT_MAILING_SUBJECT,
  DEFAULT_MAILING_TEXT,
} from "@/features/admin/lib/mailing";
import type { MailingRecipient } from "@/features/admin/server/mailing";
import {
  DashboardCard,
  DashboardHeader,
  DashboardKpiBar,
  DashboardPanel,
  DashboardPrimaryBtn,
  DashboardSecondaryBtn,
  MetricCard,
  StatusBadge,
  dashboardInputClass,
  dashboardSelectClass,
  dashboardTextareaClass,
} from "@/shared/components/admin/DashboardUI";

const initialState: MailingActionState = { status: "idle" };

type RegistrationFilter = "all" | "registered" | "not-registered";

function recipientMatches(
  recipient: MailingRecipient,
  search: string,
  registrationFilter: RegistrationFilter,
) {
  const normalizedSearch = search.trim().toLocaleLowerCase("ru-RU");
  const matchesSearch =
    !normalizedSearch ||
    recipient.fullName.toLocaleLowerCase("ru-RU").includes(normalizedSearch) ||
    recipient.email.toLocaleLowerCase("ru-RU").includes(normalizedSearch);
  const matchesRegistration =
    registrationFilter === "all" ||
    recipient.registrationState.key === registrationFilter;
  return matchesSearch && matchesRegistration;
}

function RecipientRow({
  recipient,
  checked,
  onToggle,
}: {
  recipient: MailingRecipient;
  checked: boolean;
  onToggle: (id: string) => void;
}) {
  const registrationTone =
    recipient.registrationState.key === "registered"
      ? "green"
      : recipient.registrationState.key === "disabled"
        ? "red"
        : "amber";

  return (
    <DashboardPanel
      className={`transition ${
        checked
          ? "border-[rgba(114,160,193,0.5)] bg-[var(--color-blue-wash)]/82"
          : "hover:border-[rgba(114,160,193,0.3)]"
      } ${recipient.selectable ? "" : "opacity-65"}`}
    >
      <label className={recipient.selectable ? "cursor-pointer" : "cursor-not-allowed"}>
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={checked}
            disabled={!recipient.selectable}
            onChange={() => onToggle(recipient.id)}
            className="mt-1 size-4 shrink-0 accent-[var(--color-blue)]"
            aria-label={`Выбрать ${recipient.fullName}`}
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="truncate font-semibold text-[var(--color-ink)]">
                  {recipient.fullName}
                </p>
                <p className="mt-1 truncate text-sm text-[var(--color-ink-soft)]">
                  {recipient.email}
                </p>
              </div>
              <StatusBadge tone={registrationTone}>
                {recipient.registrationState.label}
              </StatusBadge>
            </div>

            {recipient.role === "APPLICANT" ? (
              <div className="mt-4">
                <DashboardKpiBar
                  value={recipient.completionPercentage ?? 0}
                  label={
                    recipient.nominationCount === 0
                      ? "Нет номинаций"
                      : `Заполнение · номинаций: ${recipient.nominationCount}`
                  }
                />
              </div>
            ) : (
              <p className="mt-3 text-xs uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">
                Аккаунт жюри
              </p>
            )}
          </div>
        </div>
      </label>
    </DashboardPanel>
  );
}

function RecipientSection({
  title,
  description,
  recipients,
  selected,
  onToggle,
  emptyText,
  actions,
  tone,
}: {
  title: string;
  description: string;
  recipients: MailingRecipient[];
  selected: Set<string>;
  onToggle: (id: string) => void;
  emptyText: string;
  actions: React.ReactNode;
  tone: "applicant" | "jury";
}) {
  return (
    <DashboardCard
      className={
        tone === "applicant"
          ? "border-[rgba(114,160,193,0.26)]"
          : "border-[rgba(139,92,246,0.2)]"
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`flex size-9 items-center justify-center rounded-full ${
                tone === "applicant"
                  ? "bg-[var(--color-blue-wash)] text-[var(--color-blue)]"
                  : "bg-violet-50 text-violet-600"
              }`}
            >
              {tone === "applicant" ? <UserRoundCheck size={17} /> : <Users size={17} />}
            </span>
            <h2 className="font-[var(--font-title-family)] text-2xl font-light">
              {title}
            </h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--color-ink-soft)]">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">{actions}</div>
      </div>

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        {recipients.length > 0 ? (
          recipients.map((recipient) => (
            <RecipientRow
              key={recipient.id}
              recipient={recipient}
              checked={selected.has(recipient.id)}
              onToggle={onToggle}
            />
          ))
        ) : (
          <DashboardPanel className="xl:col-span-2">
            <p className="py-6 text-center text-sm text-[var(--color-ink-soft)]">
              {emptyText}
            </p>
          </DashboardPanel>
        )}
      </div>
    </DashboardCard>
  );
}

export default function AdminMailingPage({
  applicants,
  jury,
}: {
  applicants: MailingRecipient[];
  jury: MailingRecipient[];
}) {
  const [state, formAction, pending] = useActionState(sendMailingAction, initialState);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [search, setSearch] = useState("");
  const [registrationFilter, setRegistrationFilter] =
    useState<RegistrationFilter>("all");

  const visibleApplicants = useMemo(
    () =>
      applicants.filter((recipient) =>
        recipientMatches(recipient, search, registrationFilter),
      ),
    [applicants, registrationFilter, search],
  );
  const visibleJury = useMemo(
    () =>
      jury.filter((recipient) =>
        recipientMatches(recipient, search, registrationFilter),
      ),
    [jury, registrationFilter, search],
  );

  function toggleRecipient(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function addRecipients(recipients: MailingRecipient[]) {
    setSelected((current) => {
      const next = new Set(current);
      for (const recipient of recipients) {
        if (recipient.selectable) next.add(recipient.id);
      }
      return next;
    });
  }

  const registeredCount = [...applicants, ...jury].filter(
    (recipient) => recipient.registrationState.key === "registered",
  ).length;
  const incompleteCount = applicants.filter(
    (recipient) => (recipient.completionPercentage ?? 0) < 100,
  ).length;

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <DashboardHeader
        label="Коммуникации"
        title="Рассылка"
        description="Подготовьте письмо и выберите получателей. Заявители и жюри разделены по типу аккаунта; каждому адресату письмо отправляется отдельно."
        meta={
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="blue">Выбрано: {selected.size}</StatusBadge>
            <StatusBadge tone="green">Зарегистрировано: {registeredCount}</StatusBadge>
            <StatusBadge tone="amber">Незавершённых заявок: {incompleteCount}</StatusBadge>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Заявители" value={applicants.length} icon={UserRoundCheck} />
        <MetricCard label="Жюри" value={jury.length} icon={Users} accent="purple" />
        <MetricCard label="Получатели" value={selected.size} icon={Mail} accent="green" />
      </div>

      <DashboardCard>
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[var(--color-blue)]">
            <Mail size={18} />
          </span>
          <div>
            <h2 className="font-[var(--font-title-family)] text-2xl font-light">
              Текст письма
            </h2>
            <p className="text-sm text-[var(--color-ink-soft)]">
              Текст ниже уже заполнен напоминанием для заявителей и доступен для редактирования.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-[var(--color-ink)]">
            Тема письма
            <input
              name="subject"
              required
              maxLength={160}
              defaultValue={DEFAULT_MAILING_SUBJECT}
              className={dashboardInputClass}
            />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-[var(--color-ink)]">
            Сообщение
            <textarea
              name="body"
              required
              maxLength={10_000}
              rows={16}
              defaultValue={DEFAULT_MAILING_TEXT}
              className={`${dashboardTextareaClass} min-h-[360px]`}
            />
          </label>
        </div>
      </DashboardCard>

      <DashboardCard>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_250px_auto] md:items-end">
          <label className="grid gap-2 text-sm font-semibold text-[var(--color-ink)]">
            Поиск получателя
            <span className="relative block">
              <Search
                aria-hidden
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-ink-soft)]"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Имя или email"
                className={`${dashboardInputClass} pl-11`}
              />
            </span>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-[var(--color-ink)]">
            Регистрация аккаунта
            <select
              value={registrationFilter}
              onChange={(event) =>
                setRegistrationFilter(event.target.value as RegistrationFilter)
              }
              className={dashboardSelectClass}
            >
              <option value="all">Все статусы</option>
              <option value="registered">Зарегистрирован</option>
              <option value="not-registered">Не зарегистрирован</option>
            </select>
          </label>
          <DashboardSecondaryBtn type="button" onClick={() => setSelected(new Set())}>
            Очистить выбор
          </DashboardSecondaryBtn>
        </div>
      </DashboardCard>

      <RecipientSection
        title={`Заявители · ${visibleApplicants.length}`}
        description="Для каждого заявителя показан средний процент заполнения всех активных номинаций."
        recipients={visibleApplicants}
        selected={selected}
        onToggle={toggleRecipient}
        emptyText="Заявители по заданным условиям не найдены."
        tone="applicant"
        actions={
          <>
            <DashboardSecondaryBtn
              type="button"
              onClick={() => addRecipients(visibleApplicants)}
            >
              Выбрать показанных
            </DashboardSecondaryBtn>
            <DashboardSecondaryBtn
              type="button"
              onClick={() =>
                addRecipients(
                  visibleApplicants.filter(
                    (recipient) => (recipient.completionPercentage ?? 0) < 100,
                  ),
                )
              }
            >
              Выбрать незавершённых
            </DashboardSecondaryBtn>
          </>
        }
      />

      <RecipientSection
        title={`Жюри · ${visibleJury.length}`}
        description="Аккаунты жюри выделены в отдельную группу и не смешиваются со списком заявителей."
        recipients={visibleJury}
        selected={selected}
        onToggle={toggleRecipient}
        emptyText="Члены жюри по заданным условиям не найдены."
        tone="jury"
        actions={
          <DashboardSecondaryBtn type="button" onClick={() => addRecipients(visibleJury)}>
            Выбрать показанных
          </DashboardSecondaryBtn>
        }
      />

      {[...selected].map((id) => (
        <input key={id} type="hidden" name="recipientIds" value={id} />
      ))}

      <DashboardCard className="sticky bottom-4 z-20 border-[rgba(114,160,193,0.32)] bg-white/92 shadow-[0_24px_70px_rgba(37,42,45,0.15)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-[var(--color-ink-soft)]">
            <input
              type="checkbox"
              name="confirmation"
              value="yes"
              required
              className="mt-1 size-4 shrink-0 accent-[var(--color-blue)]"
            />
            <span>
              Подтверждаю отправку отдельного письма каждому выбранному получателю.
            </span>
          </label>
          <DashboardPrimaryBtn type="submit" disabled={pending || selected.size === 0}>
            {pending ? (
              <>
                <Loader2 className="animate-spin" size={16} /> Отправка…
              </>
            ) : (
              <>
                <Send size={16} /> Отправить выбранным ({selected.size})
              </>
            )}
          </DashboardPrimaryBtn>
        </div>

        {state.message ? (
          <div
            role={state.status === "error" ? "alert" : "status"}
            className={`mt-4 flex items-start gap-2 rounded-[18px] border px-4 py-3 text-sm ${
              state.status === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {state.status === "success" ? (
              <CheckCircle2 className="mt-0.5 shrink-0" size={16} />
            ) : null}
            <span>{state.message}</span>
          </div>
        ) : null}
      </DashboardCard>
    </form>
  );
}

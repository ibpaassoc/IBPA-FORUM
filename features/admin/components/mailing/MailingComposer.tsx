"use client";

import { AlertCircle, CheckCircle2, Loader2, Mail, Send, X } from "lucide-react";
import type { MailingRecipientGroup } from "@/features/admin/lib/mailing";
import {
  DashboardCard,
  DashboardPrimaryBtn,
  DashboardSecondaryBtn,
  dashboardInputClass,
  dashboardTextareaClass,
} from "@/shared/components/admin/DashboardUI";
import { GROUP_META, GROUP_ORDER } from "./mailing-recipient-meta";
import type { SendProgress } from "@/features/admin/lib/mailing-runner";

export type MailingTemplateKey = "reminder" | "blank";

export const MAILING_TEMPLATES: Array<{ key: MailingTemplateKey; label: string }> = [
  { key: "reminder", label: "Напоминание заявителям" },
  { key: "blank", label: "Пустое письмо" },
];

function ProgressPanel({ progress }: { progress: SendProgress }) {
  if (progress.phase === "idle") return null;

  const percent =
    progress.total === 0 ? 0 : Math.round((progress.processed / progress.total) * 100);
  const finished = progress.phase !== "running";
  const hasProblems = progress.failed > 0 || progress.phase === "aborted";

  return (
    <div
      role={hasProblems && finished ? "alert" : "status"}
      aria-live="polite"
      className={`rounded-[20px] border p-4 text-sm ${
        finished && hasProblems
          ? "border-red-200 bg-red-50 text-red-900"
          : finished
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border-[rgba(114,160,193,0.28)] bg-[var(--color-blue-wash)] text-[var(--color-ink)]"
      }`}
    >
      <div className="flex items-center justify-between gap-3 font-semibold">
        <span className="flex items-center gap-2">
          {!finished ? (
            <Loader2 className="animate-spin" size={16} />
          ) : hasProblems ? (
            <AlertCircle size={16} />
          ) : (
            <CheckCircle2 size={16} />
          )}
          {!finished
            ? "Идёт отправка…"
            : progress.phase === "stopped"
              ? "Остановлено"
              : progress.phase === "aborted"
                ? "Отправка прервана"
                : hasProblems
                  ? "Завершено с ошибками"
                  : "Рассылка завершена"}
        </span>
        <span className="tabular-nums">
          {progress.processed} / {progress.total}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            finished && hasProblems ? "bg-red-400" : "bg-[var(--color-blue)]"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="mt-3 text-xs leading-5">
        Отправлено: <b>{progress.sent}</b>
        {progress.failed > 0 ? (
          <>
            {" "}
            · ошибок: <b>{progress.failed}</b>
          </>
        ) : null}
        {progress.skipped > 0 ? (
          <>
            {" "}
            · пропущено: <b>{progress.skipped}</b>
          </>
        ) : null}
        {progress.duplicates > 0 ? (
          <>
            {" "}
            · дубликатов адресов: <b>{progress.duplicates}</b>
          </>
        ) : null}
      </p>
      {progress.message ? <p className="mt-2 text-xs leading-5">{progress.message}</p> : null}
      {finished && progress.failed > 0 ? (
        <p className="mt-2 text-xs leading-5">
          Получатели с ошибками остаются выбранными: нажмите «Отправить» ещё раз, чтобы
          повторить только их.
        </p>
      ) : null}
    </div>
  );
}

export default function MailingComposer({
  subject,
  body,
  template,
  onSubjectChange,
  onBodyChange,
  onTemplateChange,
  selectedPerGroup,
  uniqueCount,
  duplicateCount,
  confirmed,
  onConfirmedChange,
  progress,
  running,
  onSend,
  onStop,
  onClearGroup,
  onClearAll,
}: {
  subject: string;
  body: string;
  template: MailingTemplateKey | "custom";
  onSubjectChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onTemplateChange: (key: MailingTemplateKey) => void;
  selectedPerGroup: Record<MailingRecipientGroup, number>;
  uniqueCount: number;
  duplicateCount: number;
  confirmed: boolean;
  onConfirmedChange: (value: boolean) => void;
  progress: SendProgress;
  running: boolean;
  onSend: () => void;
  onStop: () => void;
  onClearGroup: (group: MailingRecipientGroup) => void;
  onClearAll: () => void;
}) {
  const totalSelected = GROUP_ORDER.reduce(
    (sum, group) => sum + selectedPerGroup[group],
    0,
  );
  const canSend =
    !running &&
    confirmed &&
    uniqueCount > 0 &&
    subject.trim().length > 0 &&
    body.trim().length > 0;

  return (
    <DashboardCard className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[var(--color-blue)]">
          <Mail size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-[var(--font-title-family)] text-2xl font-light leading-tight">
            Письмо
          </h2>
          <p className="text-xs text-[var(--color-ink-soft)]">
            Каждому адресату уходит отдельное письмо.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Шаблон письма">
          {MAILING_TEMPLATES.map((item) => (
            <button
              key={item.key}
              type="button"
              disabled={running}
              onClick={() => onTemplateChange(item.key)}
              aria-pressed={template === item.key}
              className={`rounded-full border px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.08em] transition disabled:opacity-50 ${
                template === item.key
                  ? "border-[var(--color-blue)] bg-[var(--color-blue)] text-white"
                  : "border-[rgba(114,160,193,0.22)] bg-white/70 text-[var(--color-ink-soft)] hover:bg-[var(--color-blue-wash)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="grid gap-1.5 text-sm font-semibold text-[var(--color-ink)]">
          Тема письма
          <input
            value={subject}
            onChange={(event) => onSubjectChange(event.target.value)}
            maxLength={160}
            disabled={running}
            className={dashboardInputClass}
          />
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-[var(--color-ink)]">
          <span className="flex items-baseline justify-between gap-3">
            Сообщение
            <span className="text-xs font-normal tabular-nums text-[var(--color-ink-soft)]">
              {body.length} / 10 000
            </span>
          </span>
          <textarea
            value={body}
            onChange={(event) => onBodyChange(event.target.value)}
            maxLength={10_000}
            rows={12}
            disabled={running}
            className={`${dashboardTextareaClass} min-h-[260px] resize-y`}
          />
        </label>
      </div>

      <div className="rounded-[20px] border border-[rgba(114,160,193,0.18)] bg-white/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
            Получатели
          </p>
          {totalSelected > 0 && !running ? (
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs font-semibold text-[var(--color-blue)] hover:underline"
            >
              Очистить
            </button>
          ) : null}
        </div>
        {totalSelected === 0 ? (
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
            Никого не выбрано. Отметьте получателей в списке.
          </p>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap gap-2">
              {GROUP_ORDER.filter((group) => selectedPerGroup[group] > 0).map((group) => {
                const meta = GROUP_META[group];
                const Icon = meta.icon;
                return (
                  <span
                    key={group}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(114,160,193,0.22)] bg-white py-1 pl-2.5 pr-1.5 text-xs font-semibold text-[var(--color-ink)]"
                  >
                    <Icon aria-hidden size={13} />
                    {meta.label}: {selectedPerGroup[group]}
                    {!running ? (
                      <button
                        type="button"
                        onClick={() => onClearGroup(group)}
                        aria-label={`Убрать выбор: ${meta.label}`}
                        className="flex size-5 items-center justify-center rounded-full text-[var(--color-ink-soft)] hover:bg-[var(--color-blue-wash)]"
                      >
                        <X size={12} />
                      </button>
                    ) : null}
                  </span>
                );
              })}
            </div>
            <p className="mt-3 text-sm text-[var(--color-ink)]">
              Писем будет отправлено: <b className="tabular-nums">{uniqueCount}</b>
              {duplicateCount > 0 ? (
                <span className="text-[var(--color-ink-soft)]">
                  {" "}
                  (ещё {duplicateCount} с повторяющимся адресом объединены)
                </span>
              ) : null}
            </p>
          </>
        )}
      </div>

      <ProgressPanel progress={progress} />

      <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-[var(--color-ink-soft)]">
        <input
          type="checkbox"
          checked={confirmed}
          disabled={running}
          onChange={(event) => onConfirmedChange(event.target.checked)}
          className="mt-1 size-4 shrink-0 accent-[var(--color-blue)]"
        />
        <span>Подтверждаю отправку отдельного письма каждому выбранному получателю.</span>
      </label>

      <div className="flex flex-col gap-2 sm:flex-row">
        <DashboardPrimaryBtn
          disabled={!canSend}
          onClick={onSend}
          className="flex-1"
        >
          {running ? (
            <>
              <Loader2 className="animate-spin" size={16} /> Отправка…
            </>
          ) : (
            <>
              <Send size={16} /> Отправить ({uniqueCount})
            </>
          )}
        </DashboardPrimaryBtn>
        {running ? (
          <DashboardSecondaryBtn onClick={onStop}>Остановить</DashboardSecondaryBtn>
        ) : null}
      </div>
    </DashboardCard>
  );
}

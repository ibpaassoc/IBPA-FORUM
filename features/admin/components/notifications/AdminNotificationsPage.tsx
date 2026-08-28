"use client";

import { createPortal } from "react-dom";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type FormEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  BellRing,
  CheckCircle2,
  ExternalLink,
  LayoutTemplate,
  Loader2,
  Mail,
  PencilLine,
  Search,
  Send,
  Sparkles,
  Ticket,
  X,
} from "lucide-react";
import {
  createNotificationsAction,
  type CreateNotificationsState,
} from "@/features/notifications/actions/admin.actions";
import { parseNotificationContent } from "@/features/notifications/lib/content";
import type { NotificationRecipient } from "@/features/notifications/server/admin";
import {
  DashboardCard,
  DashboardHeader,
  DashboardPrimaryBtn,
  DashboardSecondaryBtn,
  StatusBadge,
} from "@/shared/components/admin/DashboardUI";

type Audience = "JURY" | "APPLICANT";
type ComposerMode = "MANUAL" | "TEMPLATE";
type TemplateId = "FORUM_INVITE" | "GALA_INFO";
type ActionType = "LINK" | "TICKET_MODAL";

type RecentNotification = {
  id: string;
  name: string;
  email: string;
  type: Audience;
  content: unknown;
  isViewed: boolean;
  dateCreated: Date;
};

type ManualFields = {
  title: string;
  summary: string;
  description: string;
  actionLabel: string;
  actionUrl: string;
};

const initialState: CreateNotificationsState = { status: "idle" };
const initialManualFields: ManualFields = {
  title: "",
  summary: "",
  description: "",
  actionLabel: "Подробнее",
  actionUrl: "",
};

const TEMPLATES = {
  FORUM_INVITE: {
    label: "Приглашение на форум",
    title: "Приглашение на форум",
    summary: "Присоединяйтесь к IBPA Beauty Award 2026.",
    description: "Выберите подходящий билет и завершите регистрацию на форум в несколько шагов.",
    actionLabel: "Выбрать билет",
    actionType: "TICKET_MODAL" as const,
    icon: Ticket,
  },
  GALA_INFO: {
    label: "Гала-ужин IBPA",
    title: "Гала-ужин IBPA",
    summary: "Вечер встречи профессионального сообщества IBPA.",
    description: "Откройте страницу форума, чтобы узнать детали программы и участия.",
    actionLabel: "Подробнее",
    actionType: "LINK" as const,
    icon: Sparkles,
  },
};

const inputClass =
  "h-11 w-full rounded-[14px] border border-[rgba(114,160,193,0.25)] bg-white px-3.5 text-[0.9rem] text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-ink-muted)] hover:border-[rgba(114,160,193,0.42)] focus:border-[var(--color-blue)] focus:ring-4 focus:ring-[rgba(114,160,193,0.15)]";
const textareaClass =
  "min-h-[118px] w-full resize-none rounded-[16px] border border-[rgba(114,160,193,0.25)] bg-white px-3.5 py-3 text-[0.9rem] leading-6 text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-ink-muted)] hover:border-[rgba(114,160,193,0.42)] focus:border-[var(--color-blue)] focus:ring-4 focus:ring-[rgba(114,160,193,0.15)]";
const focusRing =
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(114,160,193,0.24)]";

function RecipientAvatar({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[0.66rem] font-semibold uppercase text-[var(--color-blue)]">
      {initials || "IB"}
    </span>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs text-[var(--color-ink-soft)]">
        {label}
      </label>
      {children}
      <p id={`${htmlFor}-error`} aria-live="polite" className="mt-1.5 min-h-4 text-xs text-red-700">
        {error ?? ""}
      </p>
    </div>
  );
}

function PreviewCard({
  title,
  summary,
  description,
  actionLabel,
  actionType,
}: {
  title: string;
  summary: string;
  description: string;
  actionLabel: string;
  actionType: ActionType;
}) {
  return (
    <div className="rounded-[18px] border border-[rgba(114,160,193,0.22)] bg-[var(--color-blue-wash)]/58 p-2.5">
      <div className="rounded-[15px] border border-[rgba(37,42,45,0.08)] bg-white p-3.5 shadow-[0_12px_30px_rgba(37,42,45,0.055)]">
        <div className="flex items-center justify-between gap-3 text-[0.58rem] uppercase tracking-[0.13em] text-[var(--color-ink-soft)]">
          <strong className="font-semibold text-[var(--color-ink)]">IBPA</strong>
          <span>сейчас</span>
        </div>
        <h3 className="mt-3 font-[var(--font-title-family)] text-xl font-light leading-tight text-[var(--color-ink)]">
          {title || "Заголовок уведомления"}
        </h3>
        <p className="mt-2 text-xs font-semibold leading-5 text-[var(--color-ink)]">
          {summary || "Текст уведомления появится здесь."}
        </p>
        {description ? (
          <p className="mt-1.5 text-[0.7rem] leading-5 text-[var(--color-ink-soft)]">{description}</p>
        ) : null}
        <span className="mt-3 inline-flex min-h-8 items-center gap-1.5 rounded-full bg-[var(--color-blue)] px-3 text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-white">
          {actionType === "LINK" ? <ExternalLink size={11} /> : <Ticket size={11} />}
          {actionLabel || "Текст кнопки"}
        </span>
      </div>
    </div>
  );
}

function notificationMeta(value: unknown) {
  const parsed = parseNotificationContent(value);
  return {
    title: parsed.copy.ru.title,
    summary: parsed.copy.ru.summary,
  };
}

export default function AdminNotificationsPage({
  jury,
  members,
  recent,
}: {
  jury: NotificationRecipient[];
  members: NotificationRecipient[];
  recent: RecentNotification[];
}) {
  const router = useRouter();
  const [composerOpen, setComposerOpen] = useState(false);
  const [mode, setMode] = useState<ComposerMode>("MANUAL");
  const [templateId, setTemplateId] = useState<TemplateId>("FORUM_INVITE");
  const [audience, setAudience] = useState<Audience>("JURY");
  const [actionType, setActionType] = useState<ActionType>("TICKET_MODAL");
  const [emailAlertEnabled, setEmailAlertEnabled] = useState(false);
  const [fields, setFields] = useState<ManualFields>(initialManualFields);
  const [selectedByAudience, setSelectedByAudience] = useState<Record<Audience, Set<string>>>(() => ({
    JURY: new Set(),
    APPLICANT: new Set(),
  }));
  const [recipientSearch, setRecipientSearch] = useState("");
  const [journalSearch, setJournalSearch] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof ManualFields | "recipients" | "templateId", string>>>({});
  const [serverError, setServerError] = useState("");
  const [pageMessage, setPageMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstModeRef = useRef<HTMLButtonElement>(null);
  const pendingRef = useRef(false);

  const recipients = audience === "JURY" ? jury : members;
  const selected = selectedByAudience[audience];
  const visibleRecipients = useMemo(() => {
    const query = recipientSearch.trim().toLocaleLowerCase("ru-RU");
    return recipients.filter((recipient) =>
      !query ||
      recipient.fullName.toLocaleLowerCase("ru-RU").includes(query) ||
      recipient.email.toLocaleLowerCase("ru-RU").includes(query),
    );
  }, [recipientSearch, recipients]);
  const visibleRecent = useMemo(() => {
    const query = journalSearch.trim().toLocaleLowerCase("ru-RU");
    return recent.filter((item) => {
      const meta = notificationMeta(item.content);
      return !query || [meta.title, meta.summary, item.name, item.email]
        .some((value) => value.toLocaleLowerCase("ru-RU").includes(query));
    });
  }, [journalSearch, recent]);

  const template = TEMPLATES[templateId];
  const preview = mode === "TEMPLATE" ? template : { ...fields, actionType };
  const dirty = mode !== "MANUAL" || actionType !== "TICKET_MODAL" ||
    (Object.keys(fields) as Array<keyof ManualFields>).some((field) => fields[field] !== initialManualFields[field]) ||
    emailAlertEnabled ||
    selectedByAudience.JURY.size > 0 || selectedByAudience.APPLICANT.size > 0;

  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);

  useEffect(() => {
    if (!composerOpen) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstModeRef.current?.focus();

    const modalRoot = overlayRef.current;
    const siblings = Array.from(document.body.children).filter((element) => element !== modalRoot);
    const previousInert = siblings.map((element) => ({
      element: element as HTMLElement,
      inert: (element as HTMLElement).inert,
      ariaHidden: element.getAttribute("aria-hidden"),
    }));
    previousInert.forEach(({ element }) => {
      element.inert = true;
      element.setAttribute("aria-hidden", "true");
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pendingRef.current) {
        setComposerOpen(false);
        return;
      }
      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )).filter((element) => !element.hidden && element.offsetParent !== null);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      previousInert.forEach(({ element, inert, ariaHidden }) => {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
      });
      previousFocus?.focus();
    };
  }, [composerOpen]);

  useEffect(() => {
    if (!composerOpen || !dirty) return;
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [composerOpen, dirty]);

  function updateField(field: keyof ManualFields, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setServerError("");
  }

  function changeAudience(nextAudience: Audience) {
    setAudience(nextAudience);
    setRecipientSearch("");
    setErrors((current) => ({ ...current, recipients: undefined }));
  }

  function updateSelected(update: (current: Set<string>) => Set<string>) {
    setSelectedByAudience((current) => ({ ...current, [audience]: update(current[audience]) }));
    setErrors((current) => ({ ...current, recipients: undefined }));
  }

  function toggleRecipient(id: string) {
    updateSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function validate() {
    const nextErrors: typeof errors = {};
    if (selected.size === 0) nextErrors.recipients = "Выберите хотя бы одного получателя.";
    if (mode === "MANUAL") {
      if (!fields.title.trim()) nextErrors.title = "Введите заголовок.";
      if (!fields.summary.trim()) nextErrors.summary = "Введите текст уведомления.";
      if (!fields.actionLabel.trim()) nextErrors.actionLabel = "Введите текст кнопки.";
      if (actionType === "LINK") {
        if (!fields.actionUrl.trim()) nextErrors.actionUrl = "Укажите ссылку.";
        else if (!fields.actionUrl.startsWith("/") && !/^https?:\/\//i.test(fields.actionUrl)) {
          nextErrors.actionUrl = "Используйте адрес, начинающийся с /, http:// или https://.";
        }
      }
    }
    setErrors(nextErrors);
    const firstError = Object.keys(nextErrors)[0];
    if (firstError && firstError !== "recipients") {
      requestAnimationFrame(() => document.getElementById(`notification-${firstError}`)?.focus());
    }
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError("");
    if (!validate()) return;

    const formData = new FormData();
    formData.set("audience", audience);
    formData.set("mode", mode);
    if (mode === "TEMPLATE") {
      formData.set("templateId", templateId);
    } else {
      formData.set("title", fields.title.trim());
      formData.set("summary", fields.summary.trim());
      formData.set("description", fields.description.trim());
      formData.set("actionType", actionType);
      formData.set("actionLabel", fields.actionLabel.trim());
      if (actionType === "LINK") formData.set("actionUrl", fields.actionUrl.trim());
    }
    selected.forEach((id) => formData.append("accountIds", id));
    formData.set("sendEmail", emailAlertEnabled ? "true" : "false");

    startTransition(async () => {
      const result = await createNotificationsAction(initialState, formData);
      if (result.status === "error") {
        setServerError(result.message ?? "Не удалось создать уведомления.");
        return;
      }
      setPageMessage(result.message ?? "Уведомления созданы.");
      setSelectedByAudience((current) => ({ ...current, [audience]: new Set() }));
      setEmailAlertEnabled(false);
      setComposerOpen(false);
      router.refresh();
    });
  }

  const composer = composerOpen ? createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[var(--z-backdrop)] flex items-center justify-center bg-[rgba(24,38,50,0.38)] p-2 backdrop-blur-[5px] sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pending) setComposerOpen(false);
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-composer-title"
        aria-describedby="notification-composer-description"
        className="relative z-[var(--z-dialog)] flex max-h-[96dvh] w-full max-w-[1180px] flex-col overflow-hidden rounded-[24px] border border-white/85 bg-[rgba(255,255,255,0.97)] shadow-[0_40px_110px_rgba(22,42,58,0.28)] sm:max-h-[92dvh] sm:rounded-[28px]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[rgba(37,42,45,0.09)] px-4 py-4 sm:px-6">
          <div>
            <h2 id="notification-composer-title" className="font-[var(--font-title-family)] text-[clamp(1.75rem,3vw,2.35rem)] font-light leading-none text-[var(--color-ink)]">Создать уведомление</h2>
            <p id="notification-composer-description" className="mt-1 text-sm text-[var(--color-ink-soft)]">Настройте содержание, действие кнопки и получателей.</p>
          </div>
          <button type="button" onClick={() => setComposerOpen(false)} disabled={pending} aria-label="Закрыть окно" className={`inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--color-ink-soft)] hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}><X size={19} /></button>
        </div>

        <form onSubmit={handleSubmit} noValidate aria-busy={pending} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto xl:overflow-hidden">
            <div className="grid min-h-full xl:grid-cols-[12.5rem_minmax(0,1fr)_22rem]">
              <aside className="border-b border-[rgba(37,42,45,0.08)] p-4 xl:border-b-0 xl:border-r">
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">Тип уведомления</p>
                <div className="mt-4 grid grid-cols-2 gap-2 xl:grid-cols-1">
                  <button ref={firstModeRef} type="button" onClick={() => setMode("MANUAL")} aria-pressed={mode === "MANUAL"} className={`flex min-h-13 cursor-pointer items-center gap-3 rounded-[14px] border px-3 text-left text-sm transition ${focusRing} ${mode === "MANUAL" ? "border-[var(--color-blue)] bg-[var(--color-blue-wash)] text-[var(--color-ink)] shadow-[0_8px_22px_rgba(114,160,193,0.12)]" : "border-[rgba(37,42,45,0.1)] bg-white text-[var(--color-ink-soft)] hover:border-[rgba(114,160,193,0.42)]"}`}><PencilLine size={17} className="text-[var(--color-blue)]" /> Ручное</button>
                  <button type="button" onClick={() => setMode("TEMPLATE")} aria-pressed={mode === "TEMPLATE"} className={`flex min-h-13 cursor-pointer items-center gap-3 rounded-[14px] border px-3 text-left text-sm transition ${focusRing} ${mode === "TEMPLATE" ? "border-[var(--color-blue)] bg-[var(--color-blue-wash)] text-[var(--color-ink)] shadow-[0_8px_22px_rgba(114,160,193,0.12)]" : "border-[rgba(37,42,45,0.1)] bg-white text-[var(--color-ink-soft)] hover:border-[rgba(114,160,193,0.42)]"}`}><LayoutTemplate size={17} className="text-[var(--color-blue)]" /> Шаблоны</button>
                </div>
              </aside>

              <section className="border-b border-[rgba(37,42,45,0.08)] p-4 sm:p-5 xl:overflow-y-auto xl:border-b-0 xl:border-r">
                <h3 className="font-[var(--font-title-family)] text-xl font-light text-[var(--color-ink)]">{mode === "MANUAL" ? "Содержание" : "Выберите шаблон"}</h3>
                {mode === "MANUAL" ? (
                  <div className="mt-4 space-y-1">
                    <Field label="Заголовок" htmlFor="notification-title" error={errors.title}>
                      <input id="notification-title" value={fields.title} onChange={(event) => updateField("title", event.target.value)} maxLength={120} aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? "notification-title-error" : undefined} placeholder="Например, персональное предложение" className={inputClass} />
                    </Field>
                    <Field label="Текст уведомления" htmlFor="notification-summary" error={errors.summary}>
                      <textarea id="notification-summary" value={fields.summary} onChange={(event) => updateField("summary", event.target.value)} maxLength={360} aria-invalid={Boolean(errors.summary)} aria-describedby={errors.summary ? "notification-summary-error" : undefined} placeholder="Главное сообщение для получателя" className={`${textareaClass} min-h-[132px]`} />
                    </Field>
                    <Field label="Дополнительный текст (необязательно)" htmlFor="notification-description">
                      <textarea id="notification-description" value={fields.description} onChange={(event) => updateField("description", event.target.value)} maxLength={900} placeholder="Уточнение, условия или следующий шаг" className={`${textareaClass} min-h-[92px]`} />
                    </Field>

                    <fieldset>
                      <legend className="mb-2 text-xs text-[var(--color-ink-soft)]">Действие кнопки</legend>
                      <div className="grid grid-cols-2 rounded-[15px] border border-[rgba(114,160,193,0.2)] bg-[var(--color-blue-wash)]/45 p-1">
                        {([["LINK", "Открыть ссылку", ExternalLink], ["TICKET_MODAL", "Открыть билеты", Ticket]] as const).map(([value, label, Icon]) => (
                          <button key={value} type="button" onClick={() => { setActionType(value); setErrors((current) => ({ ...current, actionUrl: undefined })); }} aria-pressed={actionType === value} className={`flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-[11px] px-2 text-xs transition ${focusRing} ${actionType === value ? "bg-white font-semibold text-[var(--color-blue)] shadow-[0_6px_18px_rgba(37,42,45,0.08)]" : "text-[var(--color-ink-soft)] hover:bg-white/70"}`}><Icon size={14} /> {label}</button>
                        ))}
                      </div>
                    </fieldset>

                    <Field label="Текст кнопки" htmlFor="notification-actionLabel" error={errors.actionLabel}>
                      <input id="notification-actionLabel" value={fields.actionLabel} onChange={(event) => updateField("actionLabel", event.target.value)} maxLength={48} aria-invalid={Boolean(errors.actionLabel)} aria-describedby={errors.actionLabel ? "notification-actionLabel-error" : undefined} className={inputClass} />
                    </Field>
                    {actionType === "LINK" ? (
                      <Field label="Ссылка" htmlFor="notification-actionUrl" error={errors.actionUrl}>
                        <input id="notification-actionUrl" type="url" value={fields.actionUrl} onChange={(event) => updateField("actionUrl", event.target.value)} maxLength={500} aria-invalid={Boolean(errors.actionUrl)} aria-describedby={errors.actionUrl ? "notification-actionUrl-error" : undefined} placeholder="https://example.com или /account" className={inputClass} />
                      </Field>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-4 grid gap-3">
                    {(Object.entries(TEMPLATES) as Array<[TemplateId, (typeof TEMPLATES)[TemplateId]]>).map(([id, item]) => {
                      const Icon = item.icon;
                      const active = templateId === id;
                      return (
                        <button key={id} type="button" onClick={() => setTemplateId(id)} aria-pressed={active} className={`cursor-pointer rounded-[18px] border p-4 text-left transition ${focusRing} ${active ? "border-[var(--color-blue)] bg-[var(--color-blue-wash)] shadow-[0_12px_28px_rgba(114,160,193,0.13)]" : "border-[rgba(37,42,45,0.1)] bg-white hover:border-[rgba(114,160,193,0.42)]"}`}>
                          <span className="flex items-start gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-[var(--color-blue)] shadow-sm"><Icon size={17} /></span>
                            <span><strong className="block text-sm text-[var(--color-ink)]">{item.label}</strong><span className="mt-1 block text-xs leading-5 text-[var(--color-ink-soft)]">{item.summary}</span><span className="mt-2 inline-flex items-center gap-1 text-[0.64rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-blue)]">{item.actionType === "LINK" ? <ExternalLink size={12} /> : <Ticket size={12} />}{item.actionLabel}</span></span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>

              <aside className="p-4 sm:p-5 xl:flex xl:min-h-0 xl:flex-col">
                <h3 className="font-[var(--font-title-family)] text-xl font-light text-[var(--color-ink)]">Получатели</h3>
                <div className="relative mt-3 grid grid-cols-2 rounded-full border border-[rgba(114,160,193,0.22)] bg-white p-1 shadow-[inset_0_1px_3px_rgba(37,42,45,0.04)]">
                  <span aria-hidden="true" className={`absolute inset-y-1 w-[calc(50%-0.25rem)] rounded-full bg-[var(--color-blue)] shadow-[0_8px_20px_rgba(114,160,193,0.3)] transition-transform duration-300 ${audience === "APPLICANT" ? "translate-x-[calc(100%+0.5rem)]" : "translate-x-0"}`} />
                  <button type="button" onClick={() => changeAudience("JURY")} aria-pressed={audience === "JURY"} className={`relative z-10 min-h-9 cursor-pointer rounded-full text-xs ${focusRing} ${audience === "JURY" ? "font-semibold text-white" : "text-[var(--color-ink-soft)]"}`}>Жюри</button>
                  <button type="button" onClick={() => changeAudience("APPLICANT")} aria-pressed={audience === "APPLICANT"} className={`relative z-10 min-h-9 cursor-pointer rounded-full text-xs ${focusRing} ${audience === "APPLICANT" ? "font-semibold text-white" : "text-[var(--color-ink-soft)]"}`}>Участники</button>
                </div>

                <div className="relative mt-3">
                  <Search aria-hidden size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]" />
                  <label htmlFor="notification-recipient-search" className="sr-only">Поиск получателей</label>
                  <input id="notification-recipient-search" value={recipientSearch} onChange={(event) => setRecipientSearch(event.target.value)} placeholder="Поиск по имени или email" className={`${inputClass} pl-10 pr-10`} />
                  {recipientSearch ? <button type="button" onClick={() => { setRecipientSearch(""); requestAnimationFrame(() => document.getElementById("notification-recipient-search")?.focus()); }} aria-label="Очистить поиск получателей" className={`absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[var(--color-ink-soft)] hover:bg-[var(--color-blue-wash)] ${focusRing}`}><X size={14} /></button> : null}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => updateSelected((current) => new Set([...current, ...visibleRecipients.map((item) => item.id)]))} className={`min-h-9 cursor-pointer rounded-full border border-[rgba(114,160,193,0.22)] px-3 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink)] hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)] ${focusRing}`}>Выбрать всех</button>
                  <button type="button" onClick={() => updateSelected(() => new Set())} className={`min-h-9 cursor-pointer rounded-full border border-[rgba(114,160,193,0.22)] px-3 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-[var(--color-ink)] hover:border-[var(--color-blue)] hover:bg-[var(--color-blue-wash)] ${focusRing}`}>Очистить</button>
                  <span className="ml-auto text-xs text-[var(--color-ink-soft)]">Выбрано: <strong className="text-[var(--color-ink)]">{selected.size}</strong></span>
                </div>
                <p aria-live="polite" className="mt-1 min-h-4 text-xs text-red-700">{errors.recipients ?? ""}</p>

                <div className="notification-recipient-scroll mt-2 space-y-1.5 overflow-y-auto pr-1">
                  {visibleRecipients.length === 0 ? (
                    <div className="flex min-h-24 items-center justify-center rounded-[14px] border border-dashed border-[rgba(114,160,193,0.3)] p-4 text-center text-xs text-[var(--color-ink-soft)]">{recipients.length === 0 ? "В этой группе пока нет активных аккаунтов." : "Получатели не найдены."}</div>
                  ) : visibleRecipients.map((recipient) => {
                    const checked = selected.has(recipient.id);
                    return (
                      <label key={recipient.id} className={`flex cursor-pointer items-center gap-2.5 rounded-[13px] border p-2 transition ${checked ? "border-[rgba(114,160,193,0.46)] bg-[var(--color-blue-wash)]" : "border-[rgba(37,42,45,0.08)] bg-white hover:border-[rgba(114,160,193,0.3)]"}`}>
                        <input type="checkbox" checked={checked} onChange={() => toggleRecipient(recipient.id)} className="admin-checkbox" />
                        <RecipientAvatar name={recipient.fullName} />
                        <span className="min-w-0 flex-1"><span className="block truncate text-xs font-semibold text-[var(--color-ink)]">{recipient.fullName}</span><span className="mt-0.5 block truncate text-[0.68rem] text-[var(--color-ink-soft)]">{recipient.email}</span></span>
                      </label>
                    );
                  })}
                </div>

                <div className="mt-3 border-t border-[rgba(37,42,45,0.08)] pt-3">
                  <div className="mb-2 flex items-center justify-between gap-3"><h3 className="font-[var(--font-title-family)] text-lg font-light text-[var(--color-ink)]">Предпросмотр</h3><span className="text-[0.62rem] uppercase tracking-[0.12em] text-[var(--color-blue)]">{audience === "JURY" ? "Жюри" : "Участники"}</span></div>
                  <PreviewCard title={preview.title} summary={preview.summary} description={preview.description} actionLabel={preview.actionLabel} actionType={preview.actionType} />
                </div>
              </aside>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-3 border-t border-[rgba(37,42,45,0.09)] bg-white/96 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="min-h-5 text-sm">
              {serverError ? <p role="alert" className="text-red-700">{serverError}</p> : (
                <label className="flex cursor-pointer items-start gap-2.5 text-[var(--color-ink-soft)]">
                  <input type="checkbox" checked={emailAlertEnabled} onChange={(event) => setEmailAlertEnabled(event.target.checked)} className="admin-checkbox mt-0.5" />
                  <span className="flex items-start gap-1.5"><Mail size={15} className="mt-0.5 shrink-0 text-[var(--color-blue)]" /><span><span className="block font-semibold text-[var(--color-ink)]">Отправить email-оповещение</span><span className="mt-0.5 block text-xs">Выбранным пользователям придёт письмо о новом уведомлении.</span><span className="mt-1 block text-xs">Будет создано уведомлений: <strong className="text-[var(--color-ink)]">{selected.size}</strong></span></span></span>
                </label>
              )}
            </div>
            <div className="flex w-full gap-2 sm:w-auto"><DashboardSecondaryBtn onClick={() => setComposerOpen(false)} disabled={pending}>Отмена</DashboardSecondaryBtn><DashboardPrimaryBtn type="submit" disabled={pending || selected.size === 0} className="min-w-0 flex-1 sm:min-w-[15rem]">{pending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}{pending ? "Создаём…" : "Создать уведомление"}</DashboardPrimaryBtn></div>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  ) : null;

  return (
    <div className="flex flex-col gap-5">
      <DashboardHeader
        label="Коммуникации"
        title="Уведомления аккаунтов"
        description="Создавайте персональные сообщения для жюри и участников, настраивайте действие кнопки и следите за отправкой."
        actions={<DashboardPrimaryBtn onClick={() => { setPageMessage(""); setServerError(""); setComposerOpen(true); }}><Send size={16} /> Создать уведомление</DashboardPrimaryBtn>}
      />

      {pageMessage ? <div role="status" className="flex items-start gap-3 rounded-[18px] border border-emerald-200 bg-emerald-50/78 px-4 py-3 text-sm text-emerald-800"><CheckCircle2 className="mt-0.5 shrink-0" size={17} /><span>{pageMessage}</span><button type="button" onClick={() => setPageMessage("")} aria-label="Закрыть сообщение" className={`ml-auto flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full hover:bg-emerald-100 ${focusRing}`}><X size={14} /></button></div> : null}

      <DashboardCard className="overflow-hidden p-0 md:p-0">
        <div className="flex flex-col gap-3 border-b border-[rgba(37,42,45,0.08)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div><p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-blue)]">Журнал</p><h2 className="font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">Отправленные уведомления</h2></div>
          <div className="relative w-full sm:w-72">
            <Search aria-hidden size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-ink-muted)]" />
            <label htmlFor="notification-journal-search" className="sr-only">Поиск по журналу уведомлений</label>
            <input id="notification-journal-search" value={journalSearch} onChange={(event) => setJournalSearch(event.target.value)} placeholder="Поиск по заголовку" className={`${inputClass} pl-11 pr-10`} />
            {journalSearch ? <button type="button" onClick={() => { setJournalSearch(""); requestAnimationFrame(() => document.getElementById("notification-journal-search")?.focus()); }} aria-label="Очистить поиск по журналу" className={`absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-[var(--color-ink-soft)] hover:bg-[var(--color-blue-wash)] ${focusRing}`}><X size={14} /></button> : null}
          </div>
        </div>

        {visibleRecent.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center gap-3 p-6 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[var(--color-blue)]"><BellRing size={19} /></span>
            <div><p className="text-sm font-semibold text-[var(--color-ink)]">{recent.length === 0 ? "Уведомлений пока нет" : "Ничего не найдено"}</p><p className="mt-1 text-xs text-[var(--color-ink-soft)]">{recent.length === 0 ? "Создайте первое уведомление для аккаунтов." : "Измените запрос или очистите поиск."}</p></div>
            {recent.length === 0 ? <DashboardPrimaryBtn onClick={() => setComposerOpen(true)}><Send size={15} /> Создать уведомление</DashboardPrimaryBtn> : <DashboardSecondaryBtn onClick={() => setJournalSearch("")}>Очистить поиск</DashboardSecondaryBtn>}
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[760px] table-fixed text-left" aria-label="Отправленные уведомления">
                <thead className="bg-white/42 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]"><tr><th scope="col" className="w-[32%] px-5 py-3">Уведомление</th><th scope="col" className="w-[14%] px-4 py-3">Аудитория</th><th scope="col" className="w-[26%] px-4 py-3">Получатель</th><th scope="col" className="w-[13%] px-4 py-3">Статус</th><th scope="col" className="w-[15%] px-4 py-3">Создано</th></tr></thead>
                <tbody>
                  {visibleRecent.map((item) => {
                    const meta = notificationMeta(item.content);
                    return <tr key={item.id} className="border-t border-[rgba(37,42,45,0.07)] hover:bg-[var(--color-blue-wash)]/35"><td className="px-5 py-4"><p className="truncate text-sm font-semibold text-[var(--color-ink)]">{meta.title}</p><p className="mt-0.5 truncate text-xs text-[var(--color-ink-soft)]">{meta.summary}</p></td><td className="px-4 py-4"><StatusBadge tone={item.type === "JURY" ? "purple" : "blue"}>{item.type === "JURY" ? "Жюри" : "Участники"}</StatusBadge></td><td className="px-4 py-4"><p className="truncate text-sm font-semibold text-[var(--color-ink)]">{item.name}</p><p className="mt-0.5 truncate text-xs text-[var(--color-ink-soft)]">{item.email}</p></td><td className="px-4 py-4"><StatusBadge tone={item.isViewed ? "green" : "neutral"}>{item.isViewed ? "Просмотрено" : "Отправлено"}</StatusBadge></td><td className="px-4 py-4 text-xs leading-5 text-[var(--color-ink-soft)]">{new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.dateCreated))}</td></tr>;
                  })}
                </tbody>
              </table>
            </div>
            <div className="divide-y divide-[rgba(37,42,45,0.08)] md:hidden">
              {visibleRecent.map((item) => {
                const meta = notificationMeta(item.content);
                return <article key={item.id} className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-sm font-semibold text-[var(--color-ink)]">{meta.title}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--color-ink-soft)]">{meta.summary}</p></div><StatusBadge tone={item.isViewed ? "green" : "neutral"}>{item.isViewed ? "Просмотрено" : "Отправлено"}</StatusBadge></div><div className="mt-3 flex items-center gap-2"><RecipientAvatar name={item.name} /><div className="min-w-0"><p className="truncate text-xs font-semibold text-[var(--color-ink)]">{item.name}</p><p className="truncate text-[0.68rem] text-[var(--color-ink-soft)]">{item.email}</p></div><span className="ml-auto shrink-0 text-[0.68rem] text-[var(--color-ink-soft)]">{new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium" }).format(new Date(item.dateCreated))}</span></div></article>;
              })}
            </div>
          </>
        )}
      </DashboardCard>
      {composer}
    </div>
  );
}

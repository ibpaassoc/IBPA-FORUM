"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, Loader2, Send, Ticket, UserRound, X } from "lucide-react";
import { adminT } from "@/lib/i18n/admin";

type ManualTicketForm = {
  fullName: string;
  email: string;
  phone: string;
  instagram: string;
  type: "ONE_DAY" | "TWO_DAYS";
  galaDinner: boolean;
  isIbpaMember: boolean;
};

type ManualTicketDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (message: string, tone: "success" | "info") => void;
};

const initialForm: ManualTicketForm = {
  fullName: "",
  email: "",
  phone: "",
  instagram: "",
  type: "ONE_DAY",
  galaDinner: false,
  isIbpaMember: false,
};

const inputClass =
  "w-full rounded-[16px] border border-[rgba(114,160,193,0.24)] bg-white/78 px-3.5 py-2.5 text-[0.84rem] text-[#10182a] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] outline-none transition placeholder:text-[#10182a]/30 focus:border-[var(--color-blue)]/60 focus:bg-white focus:ring-4 focus:ring-[var(--color-blue)]/10";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span className="mb-1 block text-[0.64rem] font-semibold uppercase tracking-[0.13em] text-[#10182a]/55">
        {label}
      </span>
      {children}
    </label>
  );
}

export default function ManualTicketDialog({
  open,
  onClose,
  onCreated,
}: ManualTicketDialogProps) {
  const copy = adminT.tickets.manual;
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      previousFocus?.focus();
    };
  }, [onClose, open, submitting]);

  function update<K extends keyof ManualTicketForm>(
    field: K,
    value: ManualTicketForm[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
  }

  function close() {
    if (submitting) return;
    setForm(initialForm);
    setError(null);
    onClose();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/tickets/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket: form }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        created?: boolean;
        message?: string;
      };

      if (data.ok) {
        setForm(initialForm);
        onCreated(data.message ?? copy.created, "success");
        onClose();
        return;
      }
      if (data.created) {
        setForm(initialForm);
        onCreated(data.message ?? copy.emailFailed, "info");
        onClose();
        return;
      }
      setError(data.message ?? copy.requestFailed);
    } catch {
      setError(copy.requestFailed);
    } finally {
      setSubmitting(false);
    }
  }

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[rgba(5,22,43,0.68)] px-2 py-2 backdrop-blur-[6px] sm:px-5 sm:py-5"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="manual-ticket-title"
            className="no-scrollbar relative max-h-[96dvh] w-full max-w-[820px] overflow-y-auto rounded-[26px] border border-white/85 bg-[linear-gradient(145deg,rgba(255,255,255,0.98),rgba(238,248,253,0.96))] font-[var(--font-ui-family)] shadow-[0_40px_110px_rgba(3,18,38,0.38)] sm:max-h-[92vh] sm:rounded-[30px]"
            initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 12, scale: 0.985 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,rgba(114,160,193,0.2)_0%,rgba(114,160,193,0.7)_45%,rgba(185,217,235,0.75)_100%)]" />
            <div className="flex items-start justify-between gap-5 px-5 pb-3 pt-5 sm:px-7 sm:pt-6">
              <div>
                <p className="mb-1 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-[var(--color-blue)]">
                  {copy.eyebrow}
                </p>
                <h2
                  id="manual-ticket-title"
                  className="font-[var(--font-title-family)] text-[1.75rem] font-light leading-none tracking-[-0.04em] text-[#10182a] sm:text-[2.1rem]"
                >
                  {copy.title}
                </h2>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                disabled={submitting}
                aria-label={copy.close}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-[rgba(114,160,193,0.3)] bg-white/80 text-[#35536a] shadow-[0_8px_24px_rgba(114,160,193,0.12)] transition hover:border-[var(--color-blue)]/60 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-blue)]/20 disabled:opacity-50"
              >
                <X aria-hidden size={18} strokeWidth={1.8} />
              </button>
            </div>

            <form onSubmit={submit} className="px-4 pb-5 sm:px-7 sm:pb-7">
              <div className="grid gap-4 md:grid-cols-[1.05fr_0.95fr]">
                <section className="premium-glass p-4">
                  <div className="mb-3 flex items-center gap-2 text-[#10182a]">
                    <UserRound size={15} className="text-[#72a0c1]" />
                    <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.17em]">
                      {copy.attendeeSection}
                    </h3>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
                    <Field label={copy.fullName}>
                      <input
                        className={inputClass}
                        value={form.fullName}
                        onChange={(event) => update("fullName", event.target.value)}
                        autoComplete="name"
                        required
                      />
                    </Field>
                    <Field label={copy.email}>
                      <input
                        className={inputClass}
                        type="email"
                        value={form.email}
                        onChange={(event) => update("email", event.target.value)}
                        autoComplete="email"
                        required
                      />
                    </Field>
                    <Field label={copy.phone}>
                      <input
                        className={inputClass}
                        type="tel"
                        value={form.phone}
                        onChange={(event) => update("phone", event.target.value)}
                        autoComplete="tel"
                        required
                      />
                    </Field>
                    <Field label={copy.instagram}>
                      <input
                        className={inputClass}
                        value={form.instagram}
                        onChange={(event) => update("instagram", event.target.value)}
                        autoComplete="off"
                      />
                    </Field>
                  </div>
                </section>

                <section className="premium-glass p-4">
                  <div className="mb-3 flex items-center gap-2 text-[#10182a]">
                    <Ticket size={15} className="text-[#72a0c1]" />
                    <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.17em]">
                      {copy.ticketSection}
                    </h3>
                  </div>
                  <div className="grid gap-2">
                    {([
                      ["ONE_DAY", copy.oneDay],
                      ["TWO_DAYS", copy.twoDays],
                    ] as const).map(([value, label]) => {
                      const selected = form.type === value;
                      return (
                        <label
                          key={value}
                          className={`flex cursor-pointer items-center justify-between gap-3 rounded-[16px] border px-3.5 py-3 text-sm font-semibold transition focus-within:ring-4 focus-within:ring-[var(--color-blue)]/12 ${
                            selected
                              ? "border-[var(--color-blue)]/55 bg-white text-[#1766bd] shadow-[0_8px_20px_rgba(114,160,193,0.12)]"
                              : "border-[rgba(114,160,193,0.2)] bg-white/58 text-[#10182a]/65"
                          }`}
                        >
                          <input
                            type="radio"
                            name="ticketType"
                            value={value}
                            checked={selected}
                            onChange={() => update("type", value)}
                            className="sr-only"
                          />
                          <span>{label}</span>
                          <span className={`flex size-5 items-center justify-center rounded-full border ${selected ? "border-[var(--color-blue)] bg-[var(--color-blue)] text-white" : "border-[rgba(37,42,45,0.18)]"}`}>
                            {selected ? <Check size={12} strokeWidth={2.4} /> : null}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2 md:grid-cols-1">
                    {([
                      ["galaDinner", copy.galaDinner],
                      ["isIbpaMember", copy.ibpaMember],
                    ] as const).map(([field, label]) => (
                      <label
                        key={field}
                        className="flex cursor-pointer items-center gap-3 rounded-[16px] border border-[rgba(114,160,193,0.2)] bg-white/58 px-3.5 py-3 text-sm font-medium text-[#10182a] transition hover:border-[var(--color-blue)]/45 focus-within:ring-4 focus-within:ring-[var(--color-blue)]/12"
                      >
                        <input
                          type="checkbox"
                          checked={form[field]}
                          onChange={(event) => update(field, event.target.checked)}
                          className="admin-checkbox"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </section>
              </div>

              {error ? (
                <p role="alert" className="mt-4 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-[0.78rem] text-red-700">
                  {error}
                </p>
              ) : null}

              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={close}
                  disabled={submitting}
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[rgba(114,160,193,0.25)] bg-white/80 px-5 text-[0.74rem] font-semibold uppercase tracking-[0.1em] text-[#10182a] transition hover:border-[var(--color-blue)] disabled:opacity-55"
                >
                  {copy.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--color-blue)] bg-[var(--color-blue)] px-6 text-[0.74rem] font-semibold uppercase tracking-[0.1em] text-white shadow-[0_12px_28px_rgba(114,160,193,0.24)] transition hover:bg-[#4d86ad] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-blue)]/20 disabled:cursor-wait disabled:opacity-60"
                >
                  {submitting ? <Loader2 className="animate-spin" size={15} /> : <Send size={15} />}
                  {submitting ? copy.sending : copy.submit}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}

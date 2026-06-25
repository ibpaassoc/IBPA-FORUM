"use client";

import { FormEvent, useState } from "react";
import { Mail, User } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LandingPrimaryButton } from "@/shared/components/public";

type Status = "idle" | "sending" | "sent" | "error" | "invalid";

export default function ContactUsFormSection() {
  const { t } = useLanguage();
  const c = t.home.contactUs;

  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (status === "sending") return;

    const form = event.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      subject: String(data.get("subject") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
      company: String(data.get("company") ?? ""),
    };

    if (
      payload.name.length < 2 ||
      !payload.email.includes("@") ||
      payload.message.length < 10
    ) {
      setStatus("invalid");
      return;
    }

    setStatus("sending");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        setStatus("error");
        return;
      }

      setStatus("sent");
      form.reset();
    } catch {
      setStatus("error");
    }
  };

  const statusMessage =
    status === "sent"
      ? c.successMessage
      : status === "error"
        ? c.errorMessage
        : status === "invalid"
          ? c.validationMessage
          : c.privacyNote;

  const statusToneClass =
    status === "sent"
      ? "text-[#3f7d57]"
      : status === "error" || status === "invalid"
        ? "text-[#b4543f]"
        : "text-[#10182a]/48";

  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-24">
      <div className="absolute left-[-14%] top-0 h-96 w-96 rounded-full bg-[#b9d9eb]/25 blur-3xl" />
      <div className="absolute bottom-[-18%] right-[-12%] h-[30rem] w-[30rem] rounded-full bg-[#72a0c1]/10 blur-3xl" />

      <div className="page-section relative">
        <form
          onSubmit={handleSubmit}
          className="relative mx-auto w-full overflow-hidden rounded-[2.8rem] border border-[#b9d9eb]/65 bg-white/60 p-5 shadow-[0_24px_80px_rgba(114,160,193,0.14)] backdrop-blur-2xl md:p-8 lg:p-10"
        >
          <div className="absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

          <div className="mb-8 max-w-3xl">
            <p className="page-eyebrow text-[#72a0c1]">{c.eyebrow}</p>

            <h2 className="mt-4 font-(--font-display) text-[clamp(2.35rem,5vw,5.2rem)] leading-[0.9] tracking-[-0.06em] text-[#10182a]">
              {c.title}
            </h2>
          </div>

          {/* Honeypot — hidden from users, catches naive bots. */}
          <div
            aria-hidden="true"
            className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden"
          >
            <label>
              Company
              <input
                name="company"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#10182a]/42">
                {c.nameLabel}
              </span>

              <div className="flex min-h-13 items-center gap-3 rounded-full border border-[#b9d9eb]/60 bg-white/72 px-4 transition focus-within:border-[#72a0c1]/65 focus-within:bg-white">
                <User size={16} className="shrink-0 text-[#72a0c1]" />
                <input
                  name="name"
                  type="text"
                  required
                  placeholder={c.namePlaceholder}
                  className="w-full bg-transparent text-sm text-[#10182a] outline-none placeholder:text-[#10182a]/30"
                />
              </div>
            </label>

            <label>
              <span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#10182a]/42">
                {c.emailLabel}
              </span>

              <div className="flex min-h-13 items-center gap-3 rounded-full border border-[#b9d9eb]/60 bg-white/72 px-4 transition focus-within:border-[#72a0c1]/65 focus-within:bg-white">
                <Mail size={16} className="shrink-0 text-[#72a0c1]" />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder={c.emailPlaceholder}
                  className="w-full bg-transparent text-sm text-[#10182a] outline-none placeholder:text-[#10182a]/30"
                />
              </div>
            </label>
          </div>

          <label className="mt-5 block">
            <span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#10182a]/42">
              {c.subjectLabel}
            </span>

            <input
              name="subject"
              type="text"
              placeholder={c.subjectPlaceholder}
              className="min-h-13 w-full rounded-full border border-[#b9d9eb]/60 bg-white/72 px-5 text-sm text-[#10182a] outline-none transition placeholder:text-[#10182a]/30 focus:border-[#72a0c1]/65 focus:bg-white"
            />
          </label>

          <label className="mt-5 block">
            <span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#10182a]/42">
              {c.messageLabel}
            </span>

            <textarea
              name="message"
              required
              rows={7}
              placeholder={c.messagePlaceholder}
              className="w-full resize-none rounded-[1.8rem] border border-[#b9d9eb]/60 bg-white/72 px-5 py-4 text-sm text-[#10182a] outline-none transition placeholder:text-[#10182a]/30 focus:border-[#72a0c1]/65 focus:bg-white"
            />
          </label>

          <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <p
              role={status === "error" || status === "invalid" ? "alert" : undefined}
              aria-live="polite"
              className={`max-w-xl text-sm leading-5 transition-colors ${statusToneClass}`}
            >
              {statusMessage}
            </p>

            <LandingPrimaryButton type="submit" disabled={status === "sending"}>
              {status === "sending" ? c.sendingLabel : c.submitLabel}
            </LandingPrimaryButton>
          </div>
        </form>
      </div>
    </section>
  );
}

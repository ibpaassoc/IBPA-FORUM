"use client";

import { FormEvent, useState } from "react";
import { ArrowRight, Mail, MessageCircle, User } from "lucide-react";

import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { LandingSecondaryButton } from "@/shared/components/public";

export default function ContactUsFormSection() {
  const { t } = useLanguage();
  const c = t.home.contactUs;
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("sent");
  };

  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-24">
      <div className="absolute left-[-14%] top-0 h-96 w-96 rounded-full bg-[#b9d9eb]/25 blur-3xl" />
      <div className="absolute bottom-[-18%] right-[-12%] h-[30rem] w-[30rem] rounded-full bg-[#72a0c1]/10 blur-3xl" />

      <div className="page-section relative grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
        <div className="max-w-xl">
          <p className="page-eyebrow text-[#72a0c1]">{c.eyebrow}</p>

          <h2 className="mt-4 font-(--font-display) text-[clamp(2.75rem,5.4vw,6rem)] leading-[0.9] tracking-[-0.06em] text-[#10182a]">
            {c.title}
          </h2>

          <p className="mt-6 max-w-lg text-base leading-7 text-[#10182a]/62 md:text-lg">
            {c.description}
          </p>

          <div className="mt-9 grid gap-3">
            {[
              { icon: Mail, text: c.email },
              { icon: MessageCircle, text: c.note },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.text}
                  className="flex max-w-[430px] items-center gap-3 rounded-full border border-[#b9d9eb]/60 bg-white/55 px-3 py-2 backdrop-blur-2xl"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/85 bg-white/80">
                    <Icon size={17} className="text-[#72a0c1]" />
                  </span>

                  <span className="text-sm font-medium leading-5 text-[#10182a]/62">
                    {item.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative overflow-hidden rounded-[2.7rem] border border-[#b9d9eb]/65 bg-white/58 p-4 backdrop-blur-2xl md:p-5 lg:p-6"
        >
          <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

          <div className="grid gap-4 md:grid-cols-2">
            <label>
              <span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#10182a]/42">
                {c.nameLabel}
              </span>

              <div className="flex min-h-12 items-center gap-3 rounded-full border border-[#b9d9eb]/60 bg-white/70 px-4 transition focus-within:border-[#72a0c1]/65 focus-within:bg-white">
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

              <div className="flex min-h-12 items-center gap-3 rounded-full border border-[#b9d9eb]/60 bg-white/70 px-4 transition focus-within:border-[#72a0c1]/65 focus-within:bg-white">
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

          <label className="mt-4 block">
            <span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#10182a]/42">
              {c.subjectLabel}
            </span>

            <input
              name="subject"
              type="text"
              placeholder={c.subjectPlaceholder}
              className="min-h-12 w-full rounded-full border border-[#b9d9eb]/60 bg-white/70 px-5 text-sm text-[#10182a] outline-none transition placeholder:text-[#10182a]/30 focus:border-[#72a0c1]/65 focus:bg-white"
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-2 block text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-[#10182a]/42">
              {c.messageLabel}
            </span>

            <textarea
              name="message"
              required
              rows={5}
              placeholder={c.messagePlaceholder}
              className="w-full resize-none rounded-[1.7rem] border border-[#b9d9eb]/60 bg-white/70 px-5 py-4 text-sm text-[#10182a] outline-none transition placeholder:text-[#10182a]/30 focus:border-[#72a0c1]/65 focus:bg-white"
            />
          </label>

          <div className="mt-5 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <p className="max-w-sm text-sm leading-5 text-[#10182a]/48">
              {status === "sent" ? c.successMessage : c.privacyNote}
            </p>

            <LandingSecondaryButton href="">
                {c.submitLabel}
            </LandingSecondaryButton>
          </div>
        </form>
      </div>
    </section>
  );
}

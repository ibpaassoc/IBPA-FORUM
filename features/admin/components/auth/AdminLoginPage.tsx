"use client";

import AdminLoginForm from "@/features/admin/components/auth/AdminLoginForm";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { DashboardCard } from "@/shared/components/admin/DashboardUI";

export default function AdminLoginPage() {
  const { t } = useLanguage();

  return (
    <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.72fr)] lg:items-center">
      <div className="relative hidden min-h-[520px] overflow-hidden rounded-[40px] border border-[rgba(114,160,193,0.2)] bg-[linear-gradient(135deg,rgba(185,217,235,0.34),rgba(255,255,255,0.86))] p-8 shadow-[0_28px_90px_rgba(37,42,45,0.09)] backdrop-blur-2xl lg:block">
        <div className="absolute -left-20 bottom-[-7rem] size-80 rounded-full bg-[rgba(114,160,193,0.2)] blur-3xl" />
        <p className="font-[var(--font-title-family)] text-[5rem] font-light leading-none tracking-[-0.05em] text-[var(--color-ink)]">
          IBPA
        </p>
        <p className="mt-3 max-w-sm font-[var(--font-accent-family)] text-2xl italic leading-snug text-[var(--color-blue)]">
          Beauty Award operations, refined for the team behind the ceremony.
        </p>
        <div className="absolute bottom-8 left-8 right-8 grid grid-cols-3 gap-3">
          {["Applications", "Jury", "Scoring"].map((item) => (
            <div key={item} className="rounded-[22px] bg-white/62 p-4 shadow-sm backdrop-blur-xl">
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="mb-7">
          <p className="font-[var(--font-accent-family)] text-[1.1rem] italic tracking-wide text-[var(--color-blue)]">
            {t.admin.login.eyebrow}
          </p>
          <h1 className="mt-2 font-[var(--font-title-family)] text-[clamp(3rem,12vw,5rem)] font-light leading-[0.92] tracking-[-0.035em] text-[var(--color-ink)]">
            {t.admin.login.title}
          </h1>
          <p className="mt-4 font-[var(--font-body-family)] text-sm leading-7 text-[var(--color-ink-soft)]">
            {t.admin.login.text}
          </p>
        </div>

        <DashboardCard className="p-6">
          <p className="font-[var(--font-accent-family)] text-lg italic text-[var(--color-blue)]">
            {t.admin.login.signIn}
          </p>
          <h2 className="mt-2 font-[var(--font-title-family)] text-3xl font-light tracking-[-0.02em] text-[var(--color-ink)]">
            {t.admin.login.loginTitle}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-ink-soft)]">
            {t.admin.login.loginText}
          </p>

          <div className="mt-6">
            <AdminLoginForm />
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}

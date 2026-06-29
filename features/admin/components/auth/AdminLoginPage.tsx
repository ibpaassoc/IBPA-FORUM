"use client";

import { Lock } from "lucide-react";
import AdminLoginForm from "@/features/admin/components/auth/AdminLoginForm";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { GlassCard } from "@/shared/components/admin/DashboardUI";

export default function AdminLoginPage() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto w-full max-w-md">
      <GlassCard className="p-7 sm:p-9">
        <div className="flex size-12 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[var(--color-blue)]">
          <Lock size={20} strokeWidth={1.8} aria-hidden />
        </div>

        <p className="mt-6 font-[var(--font-accent-family)] text-lg italic text-[var(--color-blue)]">
          {t.admin.login.eyebrow}
        </p>
        <h1 className="mt-1 font-[var(--font-title-family)] text-[clamp(2.2rem,7vw,3rem)] font-light leading-[0.95] tracking-[-0.03em] text-[var(--color-ink)]">
          {t.admin.login.title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[var(--color-ink-soft)]">
          {t.admin.login.loginText}
        </p>

        <div className="mt-7">
          <AdminLoginForm />
        </div>
      </GlassCard>
    </div>
  );
}

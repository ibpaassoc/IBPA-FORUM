"use client";

import AdminLoginForm from "@/features/admin/components/auth/AdminLoginForm";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function AdminLoginPage() {
  const { t } = useLanguage();

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">
            {t.admin.login.eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#10203B]">
            {t.admin.login.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{t.admin.login.text}</p>
        </div>

        <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_2px_16px_rgba(16,32,59,0.06)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#4C7D9D]">
            {t.admin.login.signIn}
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-[#10203B]">
            {t.admin.login.loginTitle}
          </h2>
          <p className="mt-1.5 text-sm leading-6 text-slate-500">{t.admin.login.loginText}</p>

          <div className="mt-6">
            <AdminLoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}

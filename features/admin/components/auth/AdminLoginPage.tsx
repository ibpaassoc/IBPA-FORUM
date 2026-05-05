"use client";

import AdminLoginForm from "@/features/admin/components/auth/AdminLoginForm";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PageShell } from "@/shared/components/layout/PageShell";

export default function AdminLoginPage() {
  const { t } = useLanguage();

  return (
    <PageShell className="px-6 py-16 md:px-10 md:py-20">
      <div className="mx-auto max-w-6xl pt-10">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="page-panel rounded-3xl p-8 md:p-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d8c27a]">
              {t.admin.login.eyebrow}
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
              {t.admin.login.title}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#d9d4ca] sm:text-base">
              {t.admin.login.text}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {t.admin.login.cards.map((item) => (
                <div key={item} className="page-card rounded-2xl bg-white/4.5 p-4">
                  <p className="text-sm font-medium text-[#f1ecde]">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="page-card rounded-3xl p-8 md:p-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d8c27a]">
              {t.admin.login.signIn}
            </p>
            <h2 className="mt-4 text-2xl font-semibold">
              {t.admin.login.loginTitle}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#d9d4ca]/85">
              {t.admin.login.loginText}
            </p>

            <AdminLoginForm />
          </section>
        </div>
      </div>
    </PageShell>
  );
}

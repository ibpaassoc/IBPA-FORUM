"use client";

import AdminLoginForm from "@/features/admin/components/auth/AdminLoginForm";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { PageShell } from "@/shared/components/layout/PageShell";

export default function AdminLoginPage() {
  const { t } = useLanguage();

  return (
    <PageShell className="admin-page px-6 py-16 md:px-10 md:py-20">
      <div className="mx-auto max-w-6xl pt-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <section className="admin-panel rounded-3xl p-8 md:p-10">
            <p className="admin-eyebrow">
              {t.admin.login.eyebrow}
            </p>
            <h1 className="admin-heading mt-5 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
              {t.admin.login.title}
            </h1>
            <p className="admin-copy mt-5 max-w-2xl text-sm leading-7 sm:text-base">
              {t.admin.login.text}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {t.admin.login.cards.map((item) => (
                <div key={item} className="admin-detail-card rounded-2xl p-4">
                  <p className="text-sm font-semibold text-[var(--color-navy)]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-card flex flex-col rounded-3xl p-8 md:p-10">
            <p className="admin-eyebrow">
              {t.admin.login.signIn}
            </p>
            <h2 className="admin-heading mt-4 text-2xl font-semibold">
              {t.admin.login.loginTitle}
            </h2>
            <p className="admin-copy mt-3 text-sm leading-6">
              {t.admin.login.loginText}
            </p>

            <AdminLoginForm />
          </section>
        </div>
      </div>
    </PageShell>
  );
}

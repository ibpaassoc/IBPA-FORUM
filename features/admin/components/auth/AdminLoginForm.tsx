"use client";

import { useActionState } from "react";
import {
  loginAdminAction,
  type AdminLoginState,
} from "@/features/admin/actions/auth.actions";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { dashboardInputClass } from "@/shared/components/admin/DashboardUI";

const initialState: AdminLoginState = {};

export default function AdminLoginForm() {
  const [state, action, pending] = useActionState(loginAdminAction, initialState);
  const { t } = useLanguage();

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-[#10203B]">
          {t.admin.login.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className={dashboardInputClass}
          placeholder={t.admin.login.placeholder}
        />
      </div>

      {state?.error && (
        <div className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-2xl border border-[var(--color-blue)] bg-[var(--color-blue)] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink)] shadow-[0_12px_28px_rgba(114,160,193,0.22)] transition hover:bg-[var(--color-blue-soft)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? t.admin.login.opening : t.admin.login.open}
      </button>
    </form>
  );
}

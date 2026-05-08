"use client";

import { useActionState } from "react";
import {
  loginAdminAction,
  type AdminLoginState,
} from "@/features/admin/actions/auth.actions";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const initialState: AdminLoginState = {};

export default function AdminLoginForm() {
  const [state, action, pending] = useActionState(loginAdminAction, initialState);
  const { t } = useLanguage();

  return (
    <form action={action} className="mt-8 space-y-5">
      <div>
        <label
          htmlFor="password"
          className="admin-label mb-2 block text-sm font-semibold"
        >
          {t.admin.login.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="admin-field w-full rounded-2xl px-4 py-3 text-sm outline-none transition"
          placeholder={t.admin.login.placeholder}
        />
      </div>

      {state?.error ? (
        <p className="admin-alert-danger rounded-2xl px-4 py-3 text-sm">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="admin-action-primary inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? t.admin.login.opening : t.admin.login.open}
      </button>
    </form>
  );
}

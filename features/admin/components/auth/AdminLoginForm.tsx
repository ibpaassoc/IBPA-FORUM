"use client";

import { useActionState } from "react";
import {
  loginAdminAction,
  type AdminLoginState,
} from "@/features/admin/actions/auth.actions";
import { adminT } from "@/lib/i18n/admin";
import { dashboardInputClass } from "@/shared/components/admin/DashboardUI";

const initialState: AdminLoginState = {};

export default function AdminLoginForm() {
  const [state, action, pending] = useActionState(loginAdminAction, initialState);

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="password" className="mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
          {adminT.login.password}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className={dashboardInputClass}
          placeholder={adminT.login.placeholder}
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
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-[var(--color-blue)] bg-[var(--color-blue)] px-6 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_16px_38px_rgba(114,160,193,0.3)] transition hover:-translate-y-0.5 hover:bg-[var(--color-hover-accent)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? adminT.login.opening : adminT.login.open}
      </button>
    </form>
  );
}

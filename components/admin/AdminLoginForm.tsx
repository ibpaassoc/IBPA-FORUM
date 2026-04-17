"use client";

import { useActionState } from "react";
import { loginAdminAction, type AdminLoginState } from "@/app/admin/actions";

const initialState: AdminLoginState = {};

export default function AdminLoginForm() {
  const [state, action, pending] = useActionState(loginAdminAction, initialState);

  return (
    <form action={action} className="mt-8 space-y-5">
      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-[#f1ecde]"
        >
          Admin password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#d9d4ca]/45 focus:border-[#d8c27a] focus:bg-white/[0.07]"
          placeholder="Enter password"
        />
      </div>

      {state?.error ? (
        <p className="rounded-2xl border border-[#a64b4b]/45 bg-[#4d1d1d]/35 px-4 py-3 text-sm text-[#f8efef]">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center rounded-full bg-[#d8c27a] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#e2d093] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Opening Admin..." : "Open Admin"}
      </button>
    </form>
  );
}

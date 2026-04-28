"use client";

import { signOut } from "next-auth/react";

export default function JurySignOutButton() {
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl: "/jury/login" })}
      className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#d8c27a] hover:text-[#d8c27a]"
    >
      Log Out
    </button>
  );
}

"use client";

import { signOut } from "next-auth/react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function JurySignOutButton() {
  const { t } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl: "/jury/login" })}
      className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:border-[#d8c27a] hover:text-[#d8c27a]"
    >
      {t.juryDashboard.signOut}
    </button>
  );
}

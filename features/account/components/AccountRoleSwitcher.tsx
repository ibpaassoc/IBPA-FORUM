"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Repeat2 } from "lucide-react";

export default function AccountRoleSwitcher({
  currentRole,
  mobile = false,
}: {
  currentRole: "APPLICANT" | "JURY";
  mobile?: boolean;
}) {
  const targetRole = currentRole === "APPLICANT" ? "jury" : "applicant";
  const targetLabel = targetRole === "jury" ? "Jury" : "Applicant";
  const destination = targetRole === "jury" ? "/account/jury" : "/account/applicant";
  const [isSwitching, setIsSwitching] = useState(false);

  async function switchAccount() {
    if (isSwitching) return;

    setIsSwitching(true);
    const result = await signIn("account-switch", {
      role: targetRole,
      redirect: false,
      callbackUrl: destination,
    });

    if (result?.ok) {
      window.location.assign(destination);
      return;
    }

    // The account may have been disabled or removed in another session. Fall
    // back to the selected login mode instead of leaving the control pending.
    window.location.assign(`/login?role=${targetRole}`);
  }

  return (
    <button
      type="button"
      onClick={switchAccount}
      disabled={isSwitching}
      className={mobile
        ? "flex min-h-12 w-full items-center gap-3 rounded-[18px] bg-[var(--color-blue-wash)] px-4 text-left text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[rgba(185,217,235,0.45)] disabled:cursor-wait disabled:opacity-70"
        : "mt-3 flex min-h-11 w-full items-center gap-3 rounded-[18px] px-3 text-left text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-ink-soft)] transition hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)] disabled:cursor-wait disabled:opacity-70"}
    >
      <Repeat2 aria-hidden size={mobile ? 17 : 16} />
      <span>{isSwitching ? "Switching account…" : `Switch to ${targetLabel}`}</span>
    </button>
  );
}

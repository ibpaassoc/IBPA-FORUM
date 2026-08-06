"use client";

import Link from "next/link";
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

  return (
    <Link
      href={`/login?role=${targetRole}&switch=1`}
      className={mobile
        ? "flex min-h-12 items-center gap-3 rounded-[18px] bg-[var(--color-blue-wash)] px-4 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[rgba(185,217,235,0.45)]"
        : "mt-3 flex min-h-11 items-center gap-3 rounded-[18px] px-3 text-[0.76rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-ink-soft)] transition hover:bg-[var(--color-blue-wash)] hover:text-[var(--color-ink)]"}
    >
      <Repeat2 aria-hidden size={mobile ? 17 : 16} />
      <span>Switch to {targetLabel}</span>
    </Link>
  );
}

"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { GlassCard, SecondaryButton } from "@/shared/components/admin/DashboardUI";

export default function TestError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Test system page failed", error);
  }, [error]);

  return (
    <GlassCard className="mx-auto max-w-2xl p-6 text-center sm:p-8">
      <AlertTriangle aria-hidden className="mx-auto text-red-600" size={30} />
      <h1 className="mt-4 font-[var(--font-title-family)] text-3xl font-light">The test tool could not load</h1>
      <p className="mt-3 text-sm leading-6 text-[var(--color-ink-soft)]">
        {error.message || "An unexpected isolated test-system error occurred."}
      </p>
      <SecondaryButton onClick={reset} className="mt-6">Try again</SecondaryButton>
    </GlassCard>
  );
}

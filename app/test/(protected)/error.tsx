"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { GlassCard, SecondaryButton } from "@/features/test/components/TestDashboardUI";

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
      <AlertTriangle aria-hidden className="mx-auto text-red-300" size={30} />
      <h1 className="mt-4 font-sans text-3xl font-semibold tracking-[-0.035em] text-white">This page could not load</h1>
      <p className="mt-3 text-sm leading-6 text-zinc-400">
        {error.message || "An unexpected isolated test-system error occurred."}
      </p>
      <SecondaryButton onClick={reset} className="mt-6">Try again</SecondaryButton>
    </GlassCard>
  );
}

import { notFound, redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { loginToTestSystem } from "./actions";
import { getTestSession, isTestSystemAvailable } from "@/features/test/server/auth";
import {
  DashboardShell,
  GlassCard,
  PremiumButton,
  dashboardInputClass,
} from "@/shared/components/admin/DashboardUI";

export const dynamic = "force-dynamic";

export default async function TestLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; retry?: string }>;
}) {
  if (!isTestSystemAvailable()) notFound();
  if (await getTestSession()) redirect("/test");
  const { error, retry } = await searchParams;
  const errorMessage =
    error === "rate_limited"
      ? `Too many attempts. Try again in ${retry ?? "a few"} seconds.`
      : error === "invalid_password"
        ? "The test password is incorrect."
        : null;

  return (
    <DashboardShell className="font-[var(--font-ui-family)]">
      <main className="relative mx-auto flex min-h-screen w-full max-w-lg items-center px-4 py-12">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 size-[28rem] -translate-x-1/2 rounded-full bg-[rgba(185,217,235,0.3)] blur-3xl" />
        </div>
        <GlassCard className="relative w-full p-6 sm:p-8">
          <span className="flex size-12 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[var(--color-blue)]">
            <LockKeyhole aria-hidden size={20} />
          </span>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-blue)]">
            Internal only
          </p>
          <h1 className="mt-2 font-[var(--font-title-family)] text-4xl font-light tracking-[-0.025em]">
            Testing system
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--color-ink-soft)]">
            Enter the server-configured test password. Production account credentials are not accepted here.
          </p>
          <form action={loginToTestSystem} className="mt-7 space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.13em] text-[var(--color-ink-soft)]">
                Test password
              </span>
              <input
                className={dashboardInputClass}
                type="password"
                name="password"
                autoComplete="current-password"
                required
                autoFocus
              />
            </label>
            {errorMessage ? (
              <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {errorMessage}
              </p>
            ) : null}
            <PremiumButton type="submit" className="w-full">Sign in</PremiumButton>
          </form>
        </GlassCard>
      </main>
    </DashboardShell>
  );
}

import { notFound, redirect } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { loginToTestSystem } from "./actions";
import { getTestSession, isTestSystemAvailable } from "@/features/test/server/auth";
import {
  DashboardShell,
  GlassCard,
  PremiumButton,
  dashboardInputClass,
} from "@/features/test/components/TestDashboardUI";

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
    <DashboardShell>
      <main className="relative mx-auto flex min-h-screen w-full max-w-lg items-center px-4 py-12">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 size-[30rem] -translate-x-1/2 rounded-full bg-white/[0.05] blur-3xl" />
        </div>
        <GlassCard className="relative w-full p-6 sm:p-8">
          <span className="flex size-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white">
            <LockKeyhole aria-hidden size={20} />
          </span>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Internal only
          </p>
          <h1 className="mt-2 font-sans text-4xl font-semibold tracking-[-0.045em] text-white">
            Testing system
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Sign in with the test-system password.
          </p>
          <form action={loginToTestSystem} className="mt-7 space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.13em] text-zinc-500">
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
              <p role="alert" className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
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

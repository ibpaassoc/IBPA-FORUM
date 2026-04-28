import type { ReactNode } from "react";
import Link from "next/link";
import { PageShell } from "@/shared/components/layout/PageShell";

export default function JuryAuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <PageShell className="px-6 py-16 md:px-10 md:py-20">
      <div className="mx-auto max-w-6xl pt-10">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="page-panel rounded-3xl p-8 md:p-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#d8c27a]">
              {eyebrow}
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#d9d4ca] sm:text-base">
              {description}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                "Private jury access",
                "Category-limited review",
                "Luxury IBPA styling",
              ].map((item) => (
                <div key={item} className="page-card rounded-2xl bg-white/4.5 p-4">
                  <p className="text-sm font-medium text-[#f1ecde]">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d8c27a]">
                Jury Access Rules
              </p>
              <p className="mt-4 text-sm leading-7 text-[#d9d4ca]/90">
                Registration opens only after your jury application is approved and
                payment is confirmed. Once signed in, you will see only the participant
                applications that match the categories you applied to judge.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/apply/jury"
                  className="inline-flex items-center justify-center rounded-full border border-[#d8c27a]/35 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f5f1e8] transition hover:border-[#d8c27a] hover:text-[#d8c27a]"
                >
                  Apply as Jury
                </Link>
                <Link
                  href="/jury/login"
                  className="inline-flex items-center justify-center rounded-full bg-[#d8c27a] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#111111] transition hover:opacity-90"
                >
                  Jury Login
                </Link>
              </div>
            </div>
          </section>

          <section className="page-card rounded-3xl p-8 md:p-10">
            {children}
            {footer ? <div className="mt-6">{footer}</div> : null}
          </section>
        </div>
      </div>
    </PageShell>
  );
}

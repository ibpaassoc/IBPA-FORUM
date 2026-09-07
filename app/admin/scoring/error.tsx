"use client";

import { AlertTriangle } from "lucide-react";
import { adminT } from "@/lib/i18n/admin";
import { DashboardCard, DashboardPrimaryBtn } from "@/shared/components/admin/DashboardUI";

export default function AdminScoringError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <DashboardCard className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-700"><AlertTriangle aria-hidden size={22} /></span>
      <div><h2 className="font-[var(--font-title-family)] text-2xl font-light text-[var(--color-ink)]">Не удалось загрузить оценивание</h2><p className="mt-2 text-sm text-[var(--color-ink-soft)]">Данные не изменены. Повторите запрос.</p></div>
      <DashboardPrimaryBtn type="button" onClick={reset}>{adminT.common.tryAgain}</DashboardPrimaryBtn>
    </DashboardCard>
  );
}

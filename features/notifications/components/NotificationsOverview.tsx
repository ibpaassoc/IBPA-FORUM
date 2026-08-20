"use client";

import Link from "next/link";
import { ArrowRight, BellRing } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import {
  notificationCopy,
  type AccountNotificationView,
} from "@/features/notifications/lib/content";
import { DashboardCard, DashboardPanel, StatusBadge } from "@/shared/components/admin/DashboardUI";

const overviewCopy = {
  en: { title: "Notifications", viewAll: "View all", empty: "No notifications yet" },
  ru: { title: "Уведомления", viewAll: "Смотреть все", empty: "Уведомлений пока нет" },
  ua: { title: "Сповіщення", viewAll: "Переглянути всі", empty: "Сповіщень поки немає" },
} as const;

export default function NotificationsOverview({
  notifications,
  href,
}: {
  notifications: AccountNotificationView[];
  href: string;
}) {
  const { language } = useLanguage();
  const labels = overviewCopy[language];
  return (
    <DashboardCard>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-[var(--color-blue-wash)] text-[var(--color-blue)]">
            <BellRing size={16} />
          </span>
          <h2 className="font-[var(--font-title-family)] text-2xl font-light">{labels.title}</h2>
        </div>
        <Link href={href} className="inline-flex min-h-10 items-center gap-2 rounded-full px-3 text-xs font-semibold uppercase tracking-[0.11em] text-[var(--color-blue)] hover:bg-[var(--color-blue-wash)]">
          {labels.viewAll} <ArrowRight size={14} />
        </Link>
      </div>
      <div className="mt-4 grid gap-2">
        {notifications.length === 0 ? (
          <p className="py-4 text-center text-sm text-[var(--color-ink-soft)]">{labels.empty}</p>
        ) : (
          notifications.slice(0, 3).map((notification) => {
            const copy = notificationCopy(notification.content, language);
            return (
              <Link key={notification.id} href={href}>
                <DashboardPanel className="flex items-start justify-between gap-3 transition hover:border-[rgba(114,160,193,0.3)] hover:bg-[var(--color-blue-wash)]/65">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--color-ink)]">{copy.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--color-ink-soft)]">{copy.summary}</p>
                  </div>
                  <StatusBadge tone={notification.isViewed ? "neutral" : "blue"}>
                    {notification.isViewed ? "Viewed" : "New"}
                  </StatusBadge>
                </DashboardPanel>
              </Link>
            );
          })
        )}
      </div>
    </DashboardCard>
  );
}

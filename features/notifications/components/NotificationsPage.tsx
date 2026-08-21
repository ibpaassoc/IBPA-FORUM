"use client";

import { BellRing } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import AccountPageHeader from "@/features/account/components/AccountPageHeader";
import type { AccountNotificationView } from "@/features/notifications/lib/content";
import NotificationCard from "@/features/notifications/components/NotificationCard";
import { EmptyState } from "@/shared/components/admin/DashboardUI";

const pageCopy = {
  en: {
    eyebrow: "Account inbox",
    title: "Notifications",
    emptyTitle: "You’re all caught up",
    emptyText: "New invitations and private offers will appear here.",
  },
  ru: {
    eyebrow: "Сообщения аккаунта",
    title: "Уведомления",
    emptyTitle: "Новых уведомлений нет",
    emptyText: "Новые приглашения и персональные предложения появятся здесь.",
  },
  ua: {
    eyebrow: "Повідомлення акаунта",
    title: "Сповіщення",
    emptyTitle: "Нових сповіщень немає",
    emptyText: "Нові запрошення та персональні пропозиції з’являться тут.",
  },
} as const;

export default function NotificationsPage({
  notifications,
}: {
  notifications: AccountNotificationView[];
}) {
  const { language } = useLanguage();
  const copy = pageCopy[language];
  return (
    <div className="flex flex-col gap-5">
      <AccountPageHeader eyebrow={copy.eyebrow} title={copy.title} />
      {notifications.length === 0 ? (
        <EmptyState
          icon={<BellRing size={20} />}
          title={copy.emptyTitle}
          description={copy.emptyText}
        />
      ) : (
        <div className="grid gap-4">
          {notifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))}
        </div>
      )}
    </div>
  );
}

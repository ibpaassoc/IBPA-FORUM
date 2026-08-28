import "server-only";

import type { NotificationType, Prisma } from "@prisma/client";
import type { NotificationContent } from "@/features/notifications/lib/content";
import { prisma } from "@/shared/lib/prisma";

export type NotificationRecipient = {
  id: string;
  fullName: string;
  email: string;
  role: NotificationType;
};

export async function getNotificationAdminData() {
  const [juryAccounts, applicantAccounts, recent] = await Promise.all([
    prisma.account.findMany({
      where: { role: "JURY", status: "ACTIVE", juryProfile: { isNot: null } },
      orderBy: { juryProfile: { fullName: "asc" } },
      select: { id: true, email: true, role: true, juryProfile: { select: { fullName: true } } },
    }),
    prisma.account.findMany({
      where: { role: "APPLICANT", status: "ACTIVE", applicantProfile: { isNot: null } },
      orderBy: { applicantProfile: { fullName: "asc" } },
      select: { id: true, email: true, role: true, applicantProfile: { select: { fullName: true } } },
    }),
    prisma.notification.findMany({
      orderBy: { dateCreated: "desc" },
      take: 12,
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        content: true,
        isViewed: true,
        dateCreated: true,
      },
    }),
  ]);

  return {
    jury: juryAccounts.map((account) => ({
      id: account.id,
      email: account.email,
      role: account.role,
      fullName: account.juryProfile?.fullName ?? account.email,
    })) satisfies NotificationRecipient[],
    members: applicantAccounts.map((account) => ({
      id: account.id,
      email: account.email,
      role: account.role,
      fullName: account.applicantProfile?.fullName ?? account.email,
    })) satisfies NotificationRecipient[],
    recent,
  };
}

const TEMPLATE_CONTENT = {
  FORUM_INVITE: {
    title: "Приглашение на форум",
    summary: "Присоединяйтесь к IBPA Beauty Award 2026.",
    description: "Выберите подходящий билет и завершите регистрацию на форум в несколько шагов.",
    actionLabel: "Выбрать билет",
    action: { type: "TICKET_MODAL" as const },
  },
  GALA_INFO: {
    title: "Гала-ужин IBPA",
    summary: "Вечер встречи профессионального сообщества IBPA.",
    description: "Откройте страницу форума, чтобы узнать детали программы и участия.",
    actionLabel: "Подробнее",
    action: { type: "LINK" as const, url: "/" },
  },
};

function repeatCopy(copy: {
  title: string;
  summary: string;
  description: string;
  actionLabel: string;
}) {
  return { en: copy, ru: copy, ua: copy };
}

function notificationContent(input: {
  mode: "MANUAL" | "TEMPLATE";
  templateId?: "FORUM_INVITE" | "GALA_INFO";
  title?: string;
  summary?: string;
  description?: string;
  actionType?: "LINK" | "TICKET_MODAL";
  actionLabel?: string;
  actionUrl?: string;
}): NotificationContent {
  const template = input.mode === "TEMPLATE" && input.templateId
    ? TEMPLATE_CONTENT[input.templateId]
    : null;
  const copy = template ?? {
    title: input.title!,
    summary: input.summary!,
    description: input.description ?? "",
    actionLabel: input.actionLabel!,
    action: input.actionType === "LINK"
      ? { type: "LINK" as const, url: input.actionUrl! }
      : { type: "TICKET_MODAL" as const },
  };

  return {
    schemaVersion: 1,
    kind: "MANUAL",
    copy: repeatCopy({
      title: copy.title,
      summary: copy.summary,
      description: copy.description,
      actionLabel: copy.actionLabel,
    }),
    action: copy.action,
    ...(input.mode === "TEMPLATE" && input.templateId ? { templateId: input.templateId } : {}),
  };
}

export async function createAccountNotifications({
  audience,
  mode,
  templateId,
  title,
  summary,
  description,
  actionType,
  actionLabel,
  actionUrl,
  accountIds,
}: {
  audience: NotificationType;
  mode: "MANUAL" | "TEMPLATE";
  templateId?: "FORUM_INVITE" | "GALA_INFO";
  title?: string;
  summary?: string;
  description?: string;
  actionType?: "LINK" | "TICKET_MODAL";
  actionLabel?: string;
  actionUrl?: string;
  accountIds: string[];
}) {
  const role = audience;
  const uniqueIds = [...new Set(accountIds)];
  const accounts = await prisma.account.findMany({
    where: {
      id: { in: uniqueIds },
      role,
      status: "ACTIVE",
      ...(role === "JURY"
        ? { juryProfile: { isNot: null } }
        : { applicantProfile: { isNot: null } }),
    },
    select: {
      id: true,
      email: true,
      juryProfile: { select: { fullName: true } },
      applicantProfile: { select: { fullName: true } },
    },
  });

  if (accounts.length === 0) return { created: 0, skipped: uniqueIds.length };

  const content = notificationContent({
    mode,
    templateId,
    title,
    summary,
    description,
    actionType,
    actionLabel,
    actionUrl,
  }) as unknown as Prisma.InputJsonValue;
  const result = await prisma.notification.createMany({
    data: accounts.map((account) => ({
      accountId: account.id,
      type: role,
      name: account.juryProfile?.fullName ?? account.applicantProfile?.fullName ?? account.email,
      email: account.email,
      content,
    })),
  });

  return { created: result.count, skipped: uniqueIds.length - accounts.length };
}

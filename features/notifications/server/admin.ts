import "server-only";

import type { NotificationType, Prisma } from "@prisma/client";
import {
  JURY_GALA_CONTENT,
  SPECIAL_OFFER_CONTENT,
  type NotificationKind,
} from "@/features/notifications/lib/content";
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
      select: {
        id: true,
        email: true,
        role: true,
        applicantProfile: { select: { fullName: true } },
      },
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
    applicants: applicantAccounts.map((account) => ({
      id: account.id,
      email: account.email,
      role: account.role,
      fullName: account.applicantProfile?.fullName ?? account.email,
    })) satisfies NotificationRecipient[],
    recent,
  };
}

function notificationTemplate(kind: NotificationKind) {
  return kind === "JURY_GALA" ? JURY_GALA_CONTENT : SPECIAL_OFFER_CONTENT;
}

function notificationRole(kind: NotificationKind): NotificationType {
  return kind === "JURY_GALA" ? "JURY" : "APPLICANT";
}

export async function createAccountNotifications({
  kind,
  accountIds,
}: {
  kind: NotificationKind;
  accountIds: string[];
}) {
  const role = notificationRole(kind);
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

  const content = notificationTemplate(kind) as unknown as Prisma.InputJsonValue;
  const result = await prisma.notification.createMany({
    data: accounts.map((account) => ({
      accountId: account.id,
      type: role,
      name:
        account.juryProfile?.fullName ?? account.applicantProfile?.fullName ?? account.email,
      email: account.email,
      content,
    })),
  });

  return { created: result.count, skipped: uniqueIds.length - accounts.length };
}

import "server-only";

import type { AccountStatus } from "@prisma/client";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import { getFieldVisibility } from "@/features/applications/schemas/category-field-validation";
import type { ApplicationValues } from "@/features/applications/types/application.types";
import {
  parseNominationAnswers,
  parseStoredFiles,
} from "@/features/database/json-fields";
import { sendEmail, type SendEmailResult } from "@/features/email/server/send-email";
import {
  averageCompletion,
  buildAdminMailingEmail,
  deduplicateRecipientsByEmail,
  getRegistrationState,
  type MailingFormValues,
} from "@/features/admin/lib/mailing";
import { prisma } from "@/shared/lib/prisma";

export type MailingRecipient = {
  id: string;
  role: "APPLICANT" | "JURY";
  fullName: string;
  email: string;
  registrationState: ReturnType<typeof getRegistrationState>;
  accountStatus: AccountStatus;
  selectable: boolean;
  completionPercentage: number | null;
  nominationCount: number;
};

function nominationCompletion(nomination: {
  category: { slug: string };
  answers: unknown;
  files: unknown;
}) {
  const values: ApplicationValues = {};
  for (const answer of parseNominationAnswers(nomination.answers).fields) {
    values[answer.fieldId] = answer.value as ApplicationValues[string];
  }

  const storedFiles = parseStoredFiles(nomination.files).items;
  const fileKeys = new Set(storedFiles.map((file) => file.fieldId));
  const fields = categoryFieldConfigs[nomination.category.slug] ?? [];
  const requiredFields = fields.filter(
    (field) => field.required && getFieldVisibility(field, values),
  );
  const completed = requiredFields.filter((field) => {
    if (field.type === "file") return fileKeys.has(field.key);
    const value = values[field.key];
    if (Array.isArray(value)) return value.length > 0;
    return String(value ?? "").trim().length > 0;
  }).length;

  return requiredFields.length === 0
    ? 100
    : Math.round((completed / requiredFields.length) * 100);
}

export async function getMailingRecipients() {
  const accounts = await prisma.account.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      passwordHash: true,
      applicantProfile: {
        select: {
          fullName: true,
          nominations: {
            where: { status: { not: "ARCHIVED" } },
            orderBy: { createdAt: "asc" },
            select: {
              category: { select: { slug: true } },
              answers: true,
              files: true,
            },
          },
        },
      },
      juryProfile: { select: { fullName: true } },
      juryApplication: { select: { fullName: true } },
    },
  });

  const recipients: MailingRecipient[] = accounts.map((account) => {
    const nominations = account.applicantProfile?.nominations ?? [];
    const completionPercentages = nominations.map(nominationCompletion);
    const fullName =
      account.applicantProfile?.fullName ??
      account.juryProfile?.fullName ??
      account.juryApplication?.fullName ??
      account.email;

    return {
      id: account.id,
      role: account.role,
      fullName,
      email: account.email,
      registrationState: getRegistrationState(account),
      accountStatus: account.status,
      selectable: account.status !== "DISABLED",
      completionPercentage:
        account.role === "APPLICANT"
          ? averageCompletion(completionPercentages)
          : null,
      nominationCount: nominations.length,
    };
  });

  return {
    applicants: recipients.filter((recipient) => recipient.role === "APPLICANT"),
    jury: recipients.filter((recipient) => recipient.role === "JURY"),
  };
}

type MailingDeliveryResult = {
  attempted: number;
  sent: number;
  failed: number;
  skipped: number;
};

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  task: (item: T) => Promise<SendEmailResult>,
) {
  const results: SendEmailResult[] = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      try {
        results[index] = await task(items[index]);
      } catch (error) {
        results[index] = {
          delivered: false,
          reason: "resend_error",
          error: error instanceof Error ? error.message : "Unknown email error.",
        };
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );
  return results;
}

export async function sendAdminMailing(
  values: MailingFormValues,
): Promise<MailingDeliveryResult> {
  const accounts = await prisma.account.findMany({
    where: {
      id: { in: values.recipientIds },
      status: { not: "DISABLED" },
    },
    select: { id: true, email: true },
  });
  const uniqueAccounts = deduplicateRecipientsByEmail(accounts);
  const email = buildAdminMailingEmail(values);
  const results = await runWithConcurrency(uniqueAccounts, 4, (account) =>
    sendEmail({
      type: "user",
      to: account.email,
      subject: email.subject,
      html: email.html,
      text: email.text,
      templateType: "admin_mailing",
      category: "admin",
      relatedEntity: { type: "Account", id: account.id },
    }),
  );
  const sent = results.filter((result) => result.delivered).length;

  return {
    attempted: uniqueAccounts.length,
    sent,
    failed: uniqueAccounts.length - sent,
    skipped: values.recipientIds.length - uniqueAccounts.length,
  };
}

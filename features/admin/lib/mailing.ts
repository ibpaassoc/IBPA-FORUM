import { z } from "zod";
import { buildTextBody, wrapEmail } from "@/features/email/templates/layout";

export const DEFAULT_MAILING_SUBJECT =
  "Complete your IBPA Beauty Award 2026 application";

export const MAILING_ELIGIBLE_JURY_STATUSES = ["APPROVED", "PAID"] as const;

export const DEFAULT_MAILING_TEXT = `Hello!

This is a reminder that to complete your participation in the IBPA Beauty Award 2026, you must fully complete your application in your personal account.

A link to create your personal account was previously sent to your email. If you have not activated it yet, please follow the link in the email, create a password, and log in.

In your personal account, please complete all required sections for each nomination you selected and upload all necessary materials confirming your professional experience and achievements.

Please note: all applications must be fully completed and submitted by August 10, inclusive. Starting August 11, applications will be closed for editing, and you will no longer be able to add or change any information.

Please make sure in advance that all of your nominations are fully completed and all required materials have been uploaded.

If you have any questions or need assistance with your application, please contact us on Instagram: @bbeauty_forum - we’ll be happy to help.`;

/** Recipients are sent in small client-driven batches so one request never has to outlive the platform timeout. */
export const MAILING_BATCH_SIZE = 20;
export const MAILING_MAX_RECIPIENTS_PER_REQUEST = 50;

export type MailingRecipientKind = "account" | "ticket";
export type MailingRecipientGroup = "APPLICANT" | "JURY" | "TICKET";

const RECIPIENT_REF_PATTERN = /^(account|ticket):([A-Za-z0-9_-]+)$/;

export function toRecipientRef(kind: MailingRecipientKind, id: string) {
  return `${kind}:${id}`;
}

export function parseRecipientRef(ref: string) {
  const match = RECIPIENT_REF_PATTERN.exec(ref);
  if (!match) return null;
  return { kind: match[1] as MailingRecipientKind, id: match[2] };
}

/** A bare id predates ticket recipients and always meant an account. */
function normalizeRecipientRef(value: string) {
  return RECIPIENT_REF_PATTERN.test(value) ? value : toRecipientRef("account", value);
}

export function splitRecipientRefs(refs: string[]) {
  const accountIds: string[] = [];
  const ticketIds: string[] = [];
  for (const ref of refs) {
    const parsed = parseRecipientRef(ref);
    if (!parsed) continue;
    (parsed.kind === "account" ? accountIds : ticketIds).push(parsed.id);
  }
  return { accountIds, ticketIds };
}

const recipientRefsSchema = z
  .array(
    z
      .string()
      .trim()
      .min(1)
      .transform(normalizeRecipientRef)
      .pipe(z.string().regex(RECIPIENT_REF_PATTERN, "Некорректный получатель.")),
  )
  .transform((refs) => Array.from(new Set(refs)))
  .pipe(
    z
      .array(z.string())
      .min(1, "Выберите хотя бы одного получателя.")
      .max(
        MAILING_MAX_RECIPIENTS_PER_REQUEST,
        `За один запрос можно отправить не более ${MAILING_MAX_RECIPIENTS_PER_REQUEST} писем.`,
      ),
  );

export const mailingFormSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(1, "Укажите тему письма.")
    .max(160, "Тема письма не должна превышать 160 символов."),
  body: z
    .string()
    .trim()
    .min(1, "Введите текст письма.")
    .max(10_000, "Текст письма не должен превышать 10 000 символов."),
  recipientIds: recipientRefsSchema,
  /**
   * Identifies one logical mailing across batches and retries. It seeds the
   * provider idempotency key, so re-sending a batch never double-delivers.
   */
  runId: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9_-]{8,64}$/, "Некорректный идентификатор рассылки.")
    .optional(),
  confirmation: z.literal("yes", {
    error: "Подтвердите отправку выбранным получателям.",
  }),
});

export type MailingFormValues = z.infer<typeof mailingFormSchema>;

export function parseMailingFormData(formData: FormData) {
  return mailingFormSchema.safeParse({
    subject: formData.get("subject"),
    body: formData.get("body"),
    recipientIds: formData.getAll("recipientIds"),
    runId: formData.get("runId") ?? undefined,
    confirmation: formData.get("confirmation"),
  });
}

export type MailingOutcome = {
  ref: string;
  status: "sent" | "failed" | "skipped";
  reason?: string;
};

export type MailingBatchResult = {
  status: "success" | "error";
  message?: string;
  outcomes: MailingOutcome[];
};

export function chunkItems<T>(items: readonly T[], size: number) {
  const chunkSize = Math.max(1, Math.floor(size));
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += chunkSize) {
    chunks.push(items.slice(index, index + chunkSize));
  }
  return chunks;
}

/**
 * Collapses a selection to one entry per mailbox (a person can be an applicant
 * and a ticket holder at once) and splits it into sendable batches.
 */
export function planMailingBatches(
  recipients: Array<{ ref: string; email: string }>,
  batchSize = MAILING_BATCH_SIZE,
) {
  const unique = deduplicateRecipientsByEmail(recipients);
  return {
    batches: chunkItems(
      unique.map((recipient) => recipient.ref),
      batchSize,
    ),
    uniqueCount: unique.length,
    duplicateCount: recipients.length - unique.length,
  };
}

export function averageCompletion(percentages: number[]) {
  if (percentages.length === 0) return 0;
  return Math.round(
    percentages.reduce((sum, percentage) => sum + percentage, 0) /
      percentages.length,
  );
}

export function deduplicateRecipientsByEmail<T extends { email: string }>(
  recipients: T[],
) {
  const unique = new Map<string, T>();
  for (const recipient of recipients) {
    const key = recipient.email.trim().toLocaleLowerCase("en-US");
    if (!unique.has(key)) unique.set(key, recipient);
  }
  return [...unique.values()];
}

export function getRegistrationState({
  passwordHash,
  status,
}: {
  passwordHash: string | null;
  status: "INVITED" | "ACTIVE" | "DISABLED";
}) {
  if (status === "DISABLED") {
    return { key: "disabled" as const, label: "Отключён" };
  }

  if (passwordHash) {
    return { key: "registered" as const, label: "Зарегистрирован" };
  }

  return { key: "not-registered" as const, label: "Не зарегистрирован" };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function buildAdminMailingEmail({
  subject,
  body,
}: Pick<MailingFormValues, "subject" | "body">) {
  const normalizedBody = body.trim();
  const paragraphs = normalizedBody
    .split(/\n\s*\n/g)
    .map((paragraph) => escapeHtml(paragraph).replaceAll("\n", "<br />"));

  return {
    subject: subject.trim(),
    html: wrapEmail(escapeHtml(subject.trim()), paragraphs),
    text: buildTextBody(
      normalizedBody.split(/\n\s*\n/g).map((paragraph) => paragraph.trim()),
    ),
  };
}

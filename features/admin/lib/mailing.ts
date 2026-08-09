import { z } from "zod";
import { buildTextBody, wrapEmail } from "@/features/email/templates/layout";

export const DEFAULT_MAILING_SUBJECT =
  "Complete your IBPA Beauty Award 2026 application";

export const DEFAULT_MAILING_TEXT = `Hello!

This is a reminder that to complete your participation in the IBPA Beauty Award 2026, you must fully complete your application in your personal account.

A link to create your personal account was previously sent to your email. If you have not activated it yet, please follow the link in the email, create a password, and log in.

In your personal account, please complete all required sections for each nomination you selected and upload all necessary materials confirming your professional experience and achievements.

Please note: all applications must be fully completed and submitted by August 10, inclusive. Starting August 11, applications will be closed for editing, and you will no longer be able to add or change any information.

Please make sure in advance that all of your nominations are fully completed and all required materials have been uploaded.

If you have any questions or need assistance with your application, please contact us on Instagram: @bbeauty_forum - we’ll be happy to help.`;

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
  recipientIds: z
    .array(z.string().trim().min(1))
    .transform((ids) => Array.from(new Set(ids)))
    .pipe(
      z
        .array(z.string())
        .min(1, "Выберите хотя бы одного получателя.")
        .max(500, "За одну рассылку можно выбрать не более 500 получателей."),
    ),
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
    confirmation: formData.get("confirmation"),
  });
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

"use server";

import {
  mailingFormSchema,
  type MailingBatchResult,
} from "@/features/admin/lib/mailing";
import { sendAdminMailing } from "@/features/admin/server/mailing";
import { requireAdmin } from "@/shared/lib/admin-auth";

/**
 * Sends one batch of a mailing. The client splits the selection into small
 * batches and calls this repeatedly, so progress is visible and no request has
 * to survive a long-running send.
 */
export async function sendMailingAction(input: unknown): Promise<MailingBatchResult> {
  await requireAdmin();

  const parsed = mailingFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Проверьте данные рассылки.",
      outcomes: [],
    };
  }

  try {
    return { status: "success", outcomes: await sendAdminMailing(parsed.data) };
  } catch (error) {
    console.error("Admin mailing batch failed.", error);
    return {
      status: "error",
      message: "Не удалось выполнить рассылку. Попробуйте ещё раз.",
      outcomes: [],
    };
  }
}

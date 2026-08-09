"use server";

import { parseMailingFormData } from "@/features/admin/lib/mailing";
import { sendAdminMailing } from "@/features/admin/server/mailing";
import { requireAdmin } from "@/shared/lib/admin-auth";

export type MailingActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  sent?: number;
  failed?: number;
  skipped?: number;
};

export async function sendMailingAction(
  _previousState: MailingActionState,
  formData: FormData,
): Promise<MailingActionState> {
  await requireAdmin();

  const parsed = parseMailingFormData(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Проверьте данные рассылки.",
    };
  }

  try {
    const result = await sendAdminMailing(parsed.data);
    if (result.sent === 0) {
      return {
        status: "error",
        message:
          result.attempted === 0
            ? "Среди выбранных аккаунтов нет доступных получателей."
            : "Не удалось доставить ни одного письма. Проверьте настройки почты.",
        ...result,
      };
    }

    return {
      status: "success",
      message:
        result.failed > 0 || result.skipped > 0
          ? `Рассылка завершена частично: отправлено ${result.sent}, ошибок ${result.failed}, пропущено ${result.skipped}.`
          : `Рассылка отправлена: ${result.sent}.`,
      ...result,
    };
  } catch (error) {
    console.error("Admin mailing failed.", error);
    return {
      status: "error",
      message: "Не удалось выполнить рассылку. Попробуйте ещё раз.",
    };
  }
}

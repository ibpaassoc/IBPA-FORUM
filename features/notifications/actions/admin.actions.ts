"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAccountNotifications } from "@/features/notifications/server/admin";
import { requireAdmin } from "@/shared/lib/admin-auth";

const formSchema = z.object({
  audience: z.enum(["JURY", "APPLICANT"]),
  mode: z.enum(["MANUAL", "TEMPLATE"]),
  templateId: z.enum(["FORUM_INVITE", "GALA_INFO"]).optional(),
  title: z.string().trim().max(120).optional(),
  summary: z.string().trim().max(360).optional(),
  description: z.string().trim().max(900).optional(),
  actionType: z.enum(["LINK", "TICKET_MODAL"]).optional(),
  actionLabel: z.string().trim().max(48).optional(),
  actionUrl: z.string().trim().max(500).optional(),
  accountIds: z.array(z.string().min(1)).min(1),
}).superRefine((value, context) => {
  if (value.mode === "TEMPLATE") {
    if (!value.templateId) {
      context.addIssue({ code: "custom", path: ["templateId"], message: "Выберите шаблон." });
    }
    return;
  }

  const requiredFields = [
    ["title", value.title, "Введите заголовок."],
    ["summary", value.summary, "Введите текст уведомления."],
    ["actionType", value.actionType, "Выберите действие кнопки."],
    ["actionLabel", value.actionLabel, "Введите текст кнопки."],
  ] as const;
  for (const [field, fieldValue, message] of requiredFields) {
    if (!fieldValue) context.addIssue({ code: "custom", path: [field], message });
  }

  if (value.actionType === "LINK") {
    if (!value.actionUrl) {
      context.addIssue({ code: "custom", path: ["actionUrl"], message: "Укажите ссылку." });
    } else if (!value.actionUrl.startsWith("/") && !/^https?:\/\//i.test(value.actionUrl)) {
      context.addIssue({
        code: "custom",
        path: ["actionUrl"],
        message: "Используйте адрес, начинающийся с /, http:// или https://.",
      });
    }
  }
});

export type CreateNotificationsState = {
  status: "idle" | "success" | "error";
  message?: string;
  created?: number;
};

export async function createNotificationsAction(
  _previousState: CreateNotificationsState,
  formData: FormData,
): Promise<CreateNotificationsState> {
  await requireAdmin();

  const parsed = formSchema.safeParse({
    audience: formData.get("audience"),
    mode: formData.get("mode"),
    templateId: formData.get("templateId") || undefined,
    title: formData.get("title") || undefined,
    summary: formData.get("summary") || undefined,
    description: formData.get("description") || undefined,
    actionType: formData.get("actionType") || undefined,
    actionLabel: formData.get("actionLabel") || undefined,
    actionUrl: formData.get("actionUrl") || undefined,
    accountIds: formData.getAll("accountIds"),
  });
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Проверьте данные уведомления." };
  }

  try {
    const result = await createAccountNotifications(parsed.data);
    revalidatePath("/admin/notifications");
    revalidatePath("/account/applicant");
    revalidatePath("/account/jury");
    return {
      status: "success",
      created: result.created,
      message:
        result.skipped > 0
          ? `Создано уведомлений: ${result.created}. Пропущено: ${result.skipped}.`
          : `Создано уведомлений: ${result.created}.`,
    };
  } catch (error) {
    console.error("Failed to create account notifications.", error);
    return { status: "error", message: "Не удалось создать уведомления." };
  }
}

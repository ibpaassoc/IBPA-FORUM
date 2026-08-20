"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAccountNotifications } from "@/features/notifications/server/admin";
import { requireAdmin } from "@/shared/lib/admin-auth";

const formSchema = z.object({
  kind: z.enum(["JURY_GALA", "SPECIAL_OFFER_2_DAYS"]),
  accountIds: z.array(z.string().min(1)).min(1),
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
    kind: formData.get("kind"),
    accountIds: formData.getAll("accountIds"),
  });
  if (!parsed.success) {
    return { status: "error", message: "Выберите хотя бы одного получателя." };
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

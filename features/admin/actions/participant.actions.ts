"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/shared/lib/prisma";
import { requireAdmin } from "@/shared/lib/admin-auth";

export async function updateParticipantApplicationStatus(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id) {
    throw new Error("Missing participant application id.");
  }

  if (
    status !== "PAYMENT_PENDING" &&
    status !== "SUBMITTED" &&
    status !== "UNDER_REVIEW" &&
    status !== "APPROVED" &&
    status !== "REJECTED"
  ) {
    throw new Error("Invalid participant application status.");
  }

  await prisma.application.update({
    where: { id },
    data: {
      status,
    },
  });

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${id}`);
}

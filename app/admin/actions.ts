"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { loginAdmin, logoutAdmin, requireAdmin } from "@/lib/admin-auth";

export type AdminLoginState = {
  error?: string;
};

export async function loginAdminAction(
  _previousState: AdminLoginState | undefined,
  formData: FormData
) {
  const password = String(formData.get("password") ?? "").trim();
  const isAuthenticated = await loginAdmin(password);

  if (!isAuthenticated) {
    return {
      error: "Incorrect password. Please try again.",
    };
  }

  redirect("/admin/applications");
}

export async function logoutAdminAction() {
  await logoutAdmin();
  redirect("/admin");
}

export async function updateJuryApplicationReview(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const adminNotes = String(formData.get("adminNotes") ?? "").trim();

  if (!id) {
    throw new Error("Missing jury application id.");
  }

  if (
    status !== "SUBMITTED" &&
    status !== "UNDER_REVIEW" &&
    status !== "APPROVED" &&
    status !== "REJECTED"
  ) {
    throw new Error("Invalid review status.");
  }

  await prisma.juryApplication.update({
    where: { id },
    data: {
      status,
      adminNotes: adminNotes || null,
      reviewedAt: new Date(),
    },
  });

  // Refresh both the list and detail page so the saved review state appears
  // immediately after a server action submission.
  revalidatePath("/admin/jury-applications");
  revalidatePath(`/admin/jury-applications/${id}`);
}

export async function updateParticipantApplicationStatus(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id) {
    throw new Error("Missing participant application id.");
  }

  if (
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

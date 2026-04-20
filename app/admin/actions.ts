"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { loginAdmin, logoutAdmin, requireAdmin } from "@/lib/admin-auth";
import {
  approveJuryApplication,
  rejectJuryApplication,
  saveJuryApplicationNotes,
} from "@/lib/jury/service";

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

function getJuryApplicationDetailPath(id: string, params?: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  const query = searchParams.toString();
  return `/admin/jury-applications/${id}${query ? `?${query}` : ""}`;
}

function getActionErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Something went wrong while saving the jury application action.";
}

export async function saveJuryApplicationNotesAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const adminNotes = String(formData.get("adminNotes") ?? "").trim();

  if (!id) {
    throw new Error("Missing jury application id.");
  }

  try {
    await saveJuryApplicationNotes({
      id,
      adminNotes,
    });
  } catch (error) {
    redirect(
      getJuryApplicationDetailPath(id, {
        error: getActionErrorMessage(error),
      })
    );
  }

  revalidatePath("/admin/jury-applications");
  revalidatePath(`/admin/jury-applications/${id}`);
  redirect(
    getJuryApplicationDetailPath(id, {
      notice: "Notes saved successfully.",
    })
  );
}

export async function approveJuryApplicationAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");

  if (!id) {
    throw new Error("Missing jury application id.");
  }

  try {
    await approveJuryApplication(id);
  } catch (error) {
    redirect(
      getJuryApplicationDetailPath(id, {
        error: getActionErrorMessage(error),
      })
    );
  }

  revalidatePath("/admin/jury-applications");
  revalidatePath(`/admin/jury-applications/${id}`);
  redirect(
    getJuryApplicationDetailPath(id, {
      notice: "Application approved and payment link sent.",
    })
  );
}

export async function rejectJuryApplicationAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const adminNotes = String(formData.get("adminNotes") ?? "").trim();

  if (!id) {
    throw new Error("Missing jury application id.");
  }

  try {
    await rejectJuryApplication({
      id,
      adminNotes,
    });
  } catch (error) {
    redirect(
      getJuryApplicationDetailPath(id, {
        error: getActionErrorMessage(error),
      })
    );
  }

  revalidatePath("/admin/jury-applications");
  revalidatePath(`/admin/jury-applications/${id}`);
  redirect(
    getJuryApplicationDetailPath(id, {
      notice: "Application rejected successfully.",
    })
  );
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

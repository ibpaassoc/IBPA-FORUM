"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { loginAdmin, logoutAdmin, requireAdmin } from "@/lib/admin-auth";
import {
  approveJuryApplication,
  rejectJuryApplication,
  saveJuryApplicationNotes,
  updateJuryApplicationStatus,
} from "@/lib/jury/service";
import type { JuryApplicationStatus } from "@prisma/client";

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

  let notice = "Application approved and payment link sent.";

  try {
    const result = await approveJuryApplication(id);

    if (!result.emailDelivered && result.emailSkipReason === "dev_email_missing") {
      notice =
        "Application approved, but the payment email was skipped because DEV_EMAIL is not configured in development.";
    } else if (!result.emailDelivered && result.emailSkipReason === "resend_missing") {
      notice =
        "Application approved, but the payment email was skipped because RESEND_API_KEY is not configured.";
    }
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
      notice,
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

export async function updateJuryApplicationStatusAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as JuryApplicationStatus;
  const adminNotes = String(formData.get("adminNotes") ?? "").trim();

  if (!id) {
    throw new Error("Missing jury application id.");
  }

  if (
    status !== "SUBMITTED" &&
    status !== "APPROVED" &&
    status !== "REJECTED" &&
    status !== "PAID"
  ) {
    throw new Error("Invalid jury application status.");
  }

  let notice = "";

  try {
    notice = await updateJuryApplicationStatus({
      id,
      status,
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
      notice,
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

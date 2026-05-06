"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { JuryApplicationStatus } from "@prisma/client";
import {
  approveJuryApplication,
  rejectJuryApplication,
  saveJuryApplicationNotes,
  updateJuryApplicationStatus,
} from "@/features/jury/server/commands";
import { requireAdmin } from "@/shared/lib/admin-auth";

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

    if (!result.emailDelivered && result.emailSkipReason === "email_test_missing") {
      notice =
        "Application approved, but the payment email was skipped because EMAIL_TEST is not configured while email redirection is enabled.";
    } else if (!result.emailDelivered && result.emailSkipReason === "resend_missing") {
      notice =
        "Application approved, but the payment email was skipped because RESEND_API_KEY is not configured.";
    } else if (
      !result.emailDelivered &&
      result.emailSkipReason === "resend_invalid_key"
    ) {
      notice =
        "Application approved, but the payment email was skipped because RESEND_API_KEY contains invalid characters.";
    } else if (
      !result.emailDelivered &&
      result.emailSkipReason === "email_sender_missing"
    ) {
      notice =
        "Application approved, but the payment email was skipped because the sender email is not configured.";
    } else if (
      !result.emailDelivered &&
      result.emailSkipReason === "email_recipient_missing"
    ) {
      notice =
        "Application approved, but the payment email was skipped because the recipient email is not configured.";
    } else if (!result.emailDelivered && result.emailSkipReason === "resend_error") {
      notice =
        "Application approved, but Resend rejected the payment email. Check the production logs for the Resend error.";
    } else if (!result.emailDelivered) {
      notice =
        "Application approved, but the payment email was not delivered. Check the production logs for details.";
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

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { JuryApplicationStatus } from "@prisma/client";
import {
  approveJuryApplication,
  approveJuryApplicationWithoutPayment,
  deleteJuryApplication,
  editJuryApplicationFields,
  rejectJuryApplication,
  requestAdditionalInfoFromJuryApplication,
  saveJuryApplicationNotes,
  setJuryApplicationStatusDirectly,
  updateJuryApplicationStatus,
} from "@/features/jury/server/commands";
import { requireAdmin } from "@/shared/lib/admin-auth";

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
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
  const isIbpaMemberRaw = formData.get("isIbpaMember");
  const isIbpaMemberOverride =
    isIbpaMemberRaw === "true" ? true : isIbpaMemberRaw === "false" ? false : undefined;

  if (!id) {
    throw new Error("Missing jury application id.");
  }

  let notice = "Application approved and payment link sent.";

  try {
    const result = await approveJuryApplication(id, isIbpaMemberOverride);

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

export async function requestAdditionalInfoAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const infoRequestDetails = String(formData.get("infoRequestDetails") ?? "").trim();

  if (!id) throw new Error("Missing jury application id.");
  if (!infoRequestDetails) {
    redirect(
      getJuryApplicationDetailPath(id, {
        error: "Please describe what additional information is needed.",
      })
    );
  }

  let notice = "Additional information request sent to the applicant.";

  try {
    const result = await requestAdditionalInfoFromJuryApplication({ id, infoRequestDetails });

    if (!result.emailDelivered) {
      notice =
        "Status updated, but the notification email could not be delivered. Check email configuration.";
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
  redirect(getJuryApplicationDetailPath(id, { notice }));
}

export async function deleteJuryApplicationAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");

  if (!id) {
    throw new Error("Missing jury application id.");
  }

  try {
    await deleteJuryApplication(id);
  } catch (error) {
    redirect(
      getJuryApplicationDetailPath(id, {
        error: getActionErrorMessage(error),
      })
    );
  }

  revalidatePath("/admin/jury-applications");
  redirect("/admin/jury-applications");
}

export async function approveJuryApplicationWithoutPaymentAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing jury application id.");

  try {
    await approveJuryApplicationWithoutPayment(id);
  } catch (error) {
    redirect(getJuryApplicationDetailPath(id, { error: getActionErrorMessage(error) }));
  }

  revalidatePath("/admin/jury-applications");
  revalidatePath(`/admin/jury-applications/${id}`);
  redirect(getJuryApplicationDetailPath(id, { notice: "Judge approved and activated without payment." }));
}

export async function overrideJuryApplicationStatusAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as JuryApplicationStatus;

  if (!id) throw new Error("Missing jury application id.");

  const validStatuses: JuryApplicationStatus[] = [
    "SUBMITTED",
    "ADDITIONAL_INFO_REQUIRED",
    "APPROVED",
    "REJECTED",
    "PAID",
  ];
  if (!validStatuses.includes(status)) {
    redirect(getJuryApplicationDetailPath(id, { error: "Invalid status value." }));
  }

  try {
    await setJuryApplicationStatusDirectly(id, status);
  } catch (error) {
    redirect(getJuryApplicationDetailPath(id, { error: getActionErrorMessage(error) }));
  }

  revalidatePath("/admin/jury-applications");
  revalidatePath(`/admin/jury-applications/${id}`);
  redirect(
    getJuryApplicationDetailPath(id, {
      notice: `Status overridden to ${status.replace(/_/g, " ").toLowerCase()}.`,
    }),
  );
}

export async function editJuryApplicationAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing jury application id.");

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const professionalTitle = String(formData.get("professionalTitle") ?? "").trim();
  const employerAffiliation = String(formData.get("employerAffiliation") ?? "").trim();
  const yearsExperience = parseInt(String(formData.get("yearsExperience") ?? "0"), 10);
  const membershipStatus = String(formData.get("membershipStatus") ?? "").trim() || null;
  const membershipLevel = String(formData.get("membershipLevel") ?? "").trim() || null;
  const ibpaAssociationMember = formData.get("ibpaAssociationMember") === "true";
  const ibpaNumber = String(formData.get("ibpaNumber") ?? "").trim() || null;
  const previousJudgingExperience = formData.get("previousJudgingExperience") === "true";
  const previousJudgingDetails =
    String(formData.get("previousJudgingDetails") ?? "").trim() || null;
  const expertiseAreasRaw = String(formData.get("expertiseAreas") ?? "").trim();
  const expertiseAreas = expertiseAreasRaw
    ? expertiseAreasRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const professionalBio = String(formData.get("professionalBio") ?? "").trim();
  const professionalWebsite = String(formData.get("professionalWebsite") ?? "").trim() || null;
  const conflictDisclosure = String(formData.get("conflictDisclosure") ?? "").trim();
  const motivation = String(formData.get("motivation") ?? "").trim();

  if (!fullName || !email || !phone || !country || !city || !professionalTitle) {
    redirect(
      getJuryApplicationDetailPath(id, {
        error: "Please fill in all required fields (name, email, phone, location, title).",
      }),
    );
  }

  if (!professionalWebsite) {
    redirect(
      getJuryApplicationDetailPath(id, {
        error: "Instagram is required.",
      }),
    );
  }

  if (!isValidUrl(professionalWebsite)) {
    redirect(
      getJuryApplicationDetailPath(id, {
        error: "Please enter a valid Instagram URL.",
      }),
    );
  }

  try {
    await editJuryApplicationFields(id, {
      fullName,
      email,
      phone,
      country,
      city,
      professionalTitle,
      employerAffiliation,
      yearsExperience,
      membershipStatus,
      membershipLevel,
      ibpaAssociationMember,
      ibpaNumber,
      previousJudgingExperience,
      previousJudgingDetails,
      expertiseAreas,
      professionalBio,
      professionalWebsite,
      conflictDisclosure,
      motivation,
    });
  } catch (error) {
    redirect(getJuryApplicationDetailPath(id, { error: getActionErrorMessage(error) }));
  }

  revalidatePath("/admin/jury-applications");
  revalidatePath(`/admin/jury-applications/${id}`);
  redirect(getJuryApplicationDetailPath(id, { notice: "Application updated successfully." }));
}

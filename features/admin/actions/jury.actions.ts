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
  resendJuryRegistrationLink,
  saveJuryApplicationNotes,
  setJuryApplicationStatusDirectly,
  updateJuryApprovedCategories,
  updateJuryApplicationStatus,
} from "@/features/jury/server/commands";
import { adminT } from "@/lib/i18n/admin";
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

  return adminT.actions.genericError;
}

export async function updateJuryApprovedCategoriesAction(
  id: string,
  approvedCategories: string[],
) {
  await requireAdmin();

  if (!id) {
    return {
      ok: false as const,
      error: adminT.actions.missingJuryApplicationId,
    };
  }

  try {
    const savedCategories = await updateJuryApprovedCategories(id, approvedCategories);

    revalidatePath("/admin");
    revalidatePath("/admin/jury-applications");
    revalidatePath(`/admin/jury-applications/${id}`);
    revalidatePath("/account/jury");
    revalidatePath("/account/jury/nominations");
    revalidatePath("/account/jury/completed");

    return {
      ok: true as const,
      approvedCategories: savedCategories,
    };
  } catch (error) {
    return {
      ok: false as const,
      error: getActionErrorMessage(error),
    };
  }
}

export async function saveJuryApplicationNotesAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const adminNotes = String(formData.get("adminNotes") ?? "").trim();

  if (!id) {
    throw new Error(adminT.actions.missingJuryApplicationId);
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
      notice: adminT.actions.notesSaved,
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
    throw new Error(adminT.actions.missingJuryApplicationId);
  }

  let notice: string = adminT.actions.approvedWithLink;

  try {
    const result = await approveJuryApplication(id, isIbpaMemberOverride);

    if (!result.emailDelivered) {
      // Точная причина остаётся в result.emailSkipReason и в серверных логах.
      notice = `${adminT.actions.approvedEmailSkipped}${
        result.emailSkipReason ? ` (${result.emailSkipReason})` : ""
      }`;
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
    throw new Error(adminT.actions.missingJuryApplicationId);
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
      notice: adminT.actions.rejected,
    })
  );
}

export async function updateJuryApplicationStatusAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as JuryApplicationStatus;
  const adminNotes = String(formData.get("adminNotes") ?? "").trim();

  if (!id) {
    throw new Error(adminT.actions.missingJuryApplicationId);
  }

  if (
    status !== "SUBMITTED" &&
    status !== "APPROVED" &&
    status !== "REJECTED" &&
    status !== "PAID"
  ) {
    throw new Error(adminT.actions.invalidJuryStatus);
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

  if (!id) throw new Error(adminT.actions.missingJuryApplicationId);
  if (!infoRequestDetails) {
    redirect(
      getJuryApplicationDetailPath(id, {
        error: adminT.actions.infoRequestEmpty,
      })
    );
  }

  let notice: string = adminT.actions.infoRequestSent;

  try {
    const result = await requestAdditionalInfoFromJuryApplication({ id, infoRequestDetails });

    if (!result.emailDelivered) {
      notice = adminT.actions.infoRequestEmailFailed;
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
    throw new Error(adminT.actions.missingJuryApplicationId);
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
  if (!id) throw new Error(adminT.actions.missingJuryApplicationId);

  try {
    await approveJuryApplicationWithoutPayment(id);
  } catch (error) {
    redirect(getJuryApplicationDetailPath(id, { error: getActionErrorMessage(error) }));
  }

  revalidatePath("/admin/jury-applications");
  revalidatePath(`/admin/jury-applications/${id}`);
  redirect(getJuryApplicationDetailPath(id, { notice: adminT.actions.activatedWithoutPayment }));
}

export async function resendJuryRegistrationLinkAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error(adminT.actions.missingJuryApplicationId);

  const result = await resendJuryRegistrationLink(id);

  revalidatePath("/admin/jury-applications");
  revalidatePath(`/admin/jury-applications/${id}`);

  if (result.status === "ineligible") {
    redirect(getJuryApplicationDetailPath(id, { notice: adminT.actions.registrationIneligible }));
  }

  if (result.status === "delivery_failed") {
    redirect(getJuryApplicationDetailPath(id, { error: adminT.actions.registrationDeliveryFailed }));
  }

  if (result.status === "registered") {
    redirect(getJuryApplicationDetailPath(id, { notice: adminT.actions.registrationAlreadyComplete }));
  }

  redirect(getJuryApplicationDetailPath(id, { notice: adminT.actions.registrationSent }));
}

export async function overrideJuryApplicationStatusAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "") as JuryApplicationStatus;

  if (!id) throw new Error(adminT.actions.missingJuryApplicationId);

  const validStatuses: JuryApplicationStatus[] = [
    "SUBMITTED",
    "ADDITIONAL_INFO_REQUIRED",
    "APPROVED",
    "REJECTED",
    "PAID",
  ];
  if (!validStatuses.includes(status)) {
    redirect(getJuryApplicationDetailPath(id, { error: adminT.actions.invalidStatus }));
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
      notice: adminT.actions.statusOverridden(adminT.statuses[status] ?? status),
    }),
  );
}

export async function editJuryApplicationAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error(adminT.actions.missingJuryApplicationId);

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
        error: adminT.actions.requiredFields,
      }),
    );
  }

  if (!professionalWebsite) {
    redirect(
      getJuryApplicationDetailPath(id, {
        error: adminT.actions.instagramRequired,
      }),
    );
  }

  if (!isValidUrl(professionalWebsite)) {
    redirect(
      getJuryApplicationDetailPath(id, {
        error: adminT.actions.instagramInvalid,
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
  redirect(getJuryApplicationDetailPath(id, { notice: adminT.actions.applicationUpdated }));
}

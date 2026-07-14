"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { adminT } from "@/lib/i18n/admin";
import { requireAdmin } from "@/shared/lib/admin-auth";
import { syncApplicationOnChange } from "@/features/google-sheets";

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export async function updateParticipantApplicationStatus(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!id) {
    throw new Error(adminT.actions.missingApplicationId);
  }

  if (
    status !== "PAYMENT_PENDING" &&
    status !== "SUBMITTED" &&
    status !== "UNDER_REVIEW" &&
    status !== "APPROVED" &&
    status !== "REJECTED"
  ) {
    throw new Error(adminT.actions.invalidApplicationStatus);
  }

  await prisma.application.update({
    where: { id },
    data: {
      status,
    },
  });

  syncApplicationOnChange(id);

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${id}`);
}

export async function editParticipantApplicationAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error(adminT.actions.missingApplicationId);

  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const stateProvince = String(formData.get("stateProvince") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim();
  const professionalTitle = String(formData.get("professionalTitle") ?? "").trim();
  const yearsExperience = parseInt(String(formData.get("yearsExperience") ?? "0"), 10);
  const membershipNumber = String(formData.get("membershipNumber") ?? "").trim() || null;
  const membershipLevel = String(formData.get("membershipLevel") ?? "").trim() || null;
  const websiteUrl = String(formData.get("websiteUrl") ?? "").trim() || null;
  const socialUrl = String(formData.get("socialUrl") ?? "").trim() || null;
  const reviewsUrl = String(formData.get("reviewsUrl") ?? "").trim() || null;
  const heardAbout = String(formData.get("heardAbout") ?? "").trim() || null;

  if (!websiteUrl) {
    redirect(`/admin/applications/${id}?error=${encodeURIComponent(adminT.actions.instagramRequired)}`);
  }

  if (!isValidUrl(websiteUrl)) {
    redirect(`/admin/applications/${id}?error=${encodeURIComponent(adminT.actions.instagramInvalid)}`);
  }

  await prisma.application.update({
    where: { id },
    data: {
      fullName,
      email: email.toLowerCase(),
      phone,
      country,
      stateProvince,
      city,
      professionalTitle,
      yearsExperience,
      membershipNumber,
      membershipLevel,
      websiteUrl,
      socialUrl,
      reviewsUrl,
      heardAbout,
    },
  });

  syncApplicationOnChange(id);

  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${id}`);
  redirect(
    `/admin/applications/${id}?notice=${encodeURIComponent(adminT.actions.applicationUpdated)}`,
  );
}

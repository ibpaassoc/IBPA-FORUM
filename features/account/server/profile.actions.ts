"use server";

import { revalidatePath } from "next/cache";
import { requireApplicantAccount } from "@/features/account/server/accounts";
import {
  applicantProfileFields,
  applicantProfileUpdateSchema,
  type ApplicantProfileField,
} from "@/features/account/schemas/applicant-profile.schema";
import { syncApplicationOnChange } from "@/features/google-sheets";
import { prisma } from "@/shared/lib/prisma";

export type ApplicantProfileFormState = {
  status: "saved" | "error";
  /** Error codes keyed by field — translated by the account UI. */
  fieldErrors?: Partial<Record<ApplicantProfileField, string>>;
  formError?: string;
};

function emptyToNull(value: string) {
  return value === "" ? null : value;
}

/**
 * Save the applicant-editable part of the signed-in applicant's own profile.
 * The profile is always resolved from the session, never from the form, so a
 * direct POST cannot reach another applicant's record.
 */
export async function updateApplicantProfileAction(
  _previous: ApplicantProfileFormState | undefined,
  formData: FormData,
): Promise<ApplicantProfileFormState> {
  const { applicantProfile } = await requireApplicantAccount();

  const parsed = applicantProfileUpdateSchema.safeParse(
    Object.fromEntries(
      applicantProfileFields.map((field) => [field, String(formData.get(field) ?? "")]),
    ),
  );

  if (!parsed.success) {
    const fieldErrors: Partial<Record<ApplicantProfileField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (typeof field === "string" && !(field in fieldErrors)) {
        fieldErrors[field as ApplicantProfileField] = issue.message;
      }
    }
    return { status: "error", fieldErrors };
  }

  const values = parsed.data;

  try {
    await prisma.applicantProfile.update({
      where: { id: applicantProfile.id },
      data: {
        fullName: values.fullName,
        phone: emptyToNull(values.phone),
        professionalTitle: emptyToNull(values.professionalTitle),
        yearsExperience: values.yearsExperience === "" ? null : Number(values.yearsExperience),
        country: values.country,
        stateProvince: emptyToNull(values.stateProvince),
        city: values.city,
        websiteUrl: emptyToNull(values.websiteUrl),
        socialUrl: emptyToNull(values.socialUrl),
        reviewsUrl: emptyToNull(values.reviewsUrl),
      },
    });
  } catch (error) {
    console.error("Failed to update applicant profile", {
      profileId: applicantProfile.id,
      error,
    });
    return { status: "error", formError: "unknown" };
  }

  // The sidebar and every account page render the applicant name.
  revalidatePath("/account/applicant", "layout");
  syncApplicationOnChange(applicantProfile.id);

  return { status: "saved" };
}

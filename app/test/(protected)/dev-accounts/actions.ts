"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireTestSession } from "@/features/test/server/auth";
import {
  addDevApplicantNomination,
  createDevAccount,
  createDevResetLink,
  createDevSetupLink,
  deleteDevAccount,
  removeDevApplicantNomination,
  sendDevResetEmail,
  sendDevSetupEmail,
  setDevAccountEnabled,
  setDevAccountPassword,
  updateDevJuryCategories,
  type DevAccountRole,
} from "@/features/test/server/dev-accounts";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function values(formData: FormData, key: string) {
  return formData.getAll(key).map(String).map((value) => value.trim()).filter(Boolean);
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "The DEV account operation failed.";
}

function devAccountsUrl(params: { notice?: string; error?: string; link?: string }) {
  const query = new URLSearchParams();
  if (params.notice) query.set("notice", params.notice);
  if (params.error) query.set("error", params.error);
  if (params.link) query.set("link", params.link);
  return `/test/dev-accounts${query.size ? `?${query}` : ""}`;
}

async function runMutation(work: () => Promise<unknown>, notice: string) {
  await requireTestSession();
  try {
    await work();
  } catch (error) {
    redirect(devAccountsUrl({ error: errorMessage(error) }));
  }
  revalidatePath("/test/dev-accounts");
  redirect(devAccountsUrl({ notice }));
}

export async function createDevAccountAction(formData: FormData) {
  const role = text(formData, "role") as DevAccountRole;
  if (role !== "APPLICANT" && role !== "JURY") {
    redirect(devAccountsUrl({ error: "Choose applicant or jury." }));
  }
  return runMutation(
    () => createDevAccount({
      role,
      email: text(formData, "email"),
      fullName: text(formData, "fullName"),
      password: text(formData, "password") || undefined,
      awardIds: values(formData, "awardIds"),
      categoryNames: values(formData, "categoryNames"),
    }),
    `${role === "JURY" ? "Jury" : "Applicant"} DEV account created.`,
  );
}

export async function setDevAccountPasswordAction(formData: FormData) {
  return runMutation(
    () => setDevAccountPassword(text(formData, "accountId"), text(formData, "password")),
    "Password updated. The account can now sign in through /login.",
  );
}

export async function setDevAccountEnabledAction(formData: FormData) {
  const enabled = text(formData, "enabled") === "true";
  return runMutation(
    () => setDevAccountEnabled(text(formData, "accountId"), enabled),
    enabled ? "DEV account enabled." : "DEV account disabled.",
  );
}

export async function updateDevJuryCategoriesAction(formData: FormData) {
  return runMutation(
    () => updateDevJuryCategories(
      text(formData, "accountId"),
      values(formData, "categoryNames"),
    ),
    "Jury categories updated.",
  );
}

export async function addDevApplicantNominationAction(formData: FormData) {
  return runMutation(
    () => addDevApplicantNomination(
      text(formData, "accountId"),
      text(formData, "awardId"),
    ),
    "Nomination added to the DEV applicant.",
  );
}

export async function removeDevApplicantNominationAction(formData: FormData) {
  return runMutation(
    () => removeDevApplicantNomination(
      text(formData, "accountId"),
      text(formData, "nominationId"),
    ),
    "Nomination removed from the DEV applicant.",
  );
}

export async function createDevSetupLinkAction(formData: FormData) {
  await requireTestSession();
  let link: string;
  try {
    link = await createDevSetupLink(text(formData, "accountId"));
  } catch (error) {
    redirect(devAccountsUrl({ error: errorMessage(error) }));
  }
  revalidatePath("/test/dev-accounts");
  redirect(devAccountsUrl({ notice: "Setup link created.", link }));
}

export async function createDevResetLinkAction(formData: FormData) {
  await requireTestSession();
  let link: string;
  try {
    link = await createDevResetLink(text(formData, "accountId"));
  } catch (error) {
    redirect(devAccountsUrl({ error: errorMessage(error) }));
  }
  revalidatePath("/test/dev-accounts");
  redirect(devAccountsUrl({ notice: "Password reset link created.", link }));
}

export async function sendDevSetupEmailAction(formData: FormData) {
  await requireTestSession();
  let result: Awaited<ReturnType<typeof sendDevSetupEmail>>;
  try {
    result = await sendDevSetupEmail(text(formData, "accountId"));
  } catch (error) {
    redirect(devAccountsUrl({ error: errorMessage(error) }));
  }
  revalidatePath("/test/dev-accounts");
  if (!result?.delivered) {
    redirect(devAccountsUrl({
      error: result?.error ?? result?.reason ?? "Setup email could not be delivered.",
    }));
  }
  redirect(devAccountsUrl({ notice: `Setup email sent to ${result.recipient}.` }));
}

export async function sendDevResetEmailAction(formData: FormData) {
  await requireTestSession();
  let result: Awaited<ReturnType<typeof sendDevResetEmail>>;
  try {
    result = await sendDevResetEmail(text(formData, "accountId"));
  } catch (error) {
    redirect(devAccountsUrl({ error: errorMessage(error) }));
  }
  revalidatePath("/test/dev-accounts");
  if (!result.delivered) {
    redirect(devAccountsUrl({
      error: result.error ?? result.reason ?? "Reset email could not be delivered.",
    }));
  }
  redirect(devAccountsUrl({ notice: `Password reset email sent to ${result.recipient}.` }));
}

export async function deleteDevAccountAction(formData: FormData) {
  return runMutation(
    () => deleteDevAccount(text(formData, "accountId")),
    "DEV account and its isolated data were deleted.",
  );
}

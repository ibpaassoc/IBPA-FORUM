"use server";

import { normalizeAccountEmail } from "@/features/account/server/password";
import {
  APPLICANT_REGISTRATION_RESEND_COOLDOWN_MS,
  issueApplicantRegistrationLink,
} from "@/features/account/server/applicant-registration";

export type ResendRegistrationState = {
  sent?: boolean;
  error?: string;
};

export async function resendRegistrationLinkAction(
  _prev: ResendRegistrationState | undefined,
  formData: FormData
): Promise<ResendRegistrationState> {
  const email = normalizeAccountEmail(String(formData.get("registrationEmail") ?? ""));

  if (email) {
    await issueApplicantRegistrationLink({
      email,
      cooldownMs: APPLICANT_REGISTRATION_RESEND_COOLDOWN_MS,
    });
  }

  return { sent: true };
}

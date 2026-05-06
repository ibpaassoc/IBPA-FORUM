import "server-only";
import { readEnv } from "@/lib/env";

export const EMAIL_NO_REPLY = readEnv([
  "EMAIL_NO_REPLY",
  "NO_REPLY_EMAIL",
  "EMAIL_FROM",
]);
export const EMAIL_PAYMENTS = readEnv(["EMAIL_PAYMENTS", "PAYMENT_EMAIL"]);
export const EMAIL_SUPPORT = readEnv(["EMAIL_SUPPORT", "SUPPORT_EMAIL"]);
export const EMAIL_APPLICATIONS = readEnv([
  "EMAIL_APPLICATIONS",
  "APPLICATIONS_EMAIL",
]);
export const EMAIL_TEST = readEnv(["EMAIL_TEST", "TEST_EMAIL"]);
export const EMAIL_REDIRECT_ALL_TO_TEST =
  process.env.EMAIL_REDIRECT_ALL_TO_TEST?.toLowerCase() === "true";

export type EmailFromType = "user" | "application" | "payment" | "support";

export function resolveFrom(type: EmailFromType) {
  switch (type) {
    case "application":
      return EMAIL_APPLICATIONS;
    case "payment":
      return EMAIL_PAYMENTS;
    case "support":
      return EMAIL_SUPPORT;
    case "user":
      return EMAIL_NO_REPLY;
  }
}

export function resolveTo(originalTo: string) {
  if (EMAIL_REDIRECT_ALL_TO_TEST) {
    return EMAIL_TEST;
  }

  return originalTo;
}

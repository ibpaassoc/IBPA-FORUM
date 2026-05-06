import "server-only";

export const EMAIL_NO_REPLY = process.env.EMAIL_NO_REPLY ?? "";
export const EMAIL_PAYMENTS = process.env.EMAIL_PAYMENTS ?? "";
export const EMAIL_SUPPORT = process.env.EMAIL_SUPPORT ?? "";
export const EMAIL_APPLICATIONS = process.env.EMAIL_APPLICATIONS ?? "";
export const EMAIL_TEST = process.env.EMAIL_TEST ?? "";
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

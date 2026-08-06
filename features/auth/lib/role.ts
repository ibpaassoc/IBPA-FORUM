import type { AccountRole } from "@prisma/client";

export type PublicAccountRole = "applicant" | "jury";

export function parsePublicAccountRole(value: string | null | undefined): PublicAccountRole {
  return value?.toLowerCase() === "jury" ? "jury" : "applicant";
}

export function toAccountRole(role: PublicAccountRole): AccountRole {
  return role === "jury" ? "JURY" : "APPLICANT";
}

export function getDashboardPathForPublicRole(role: PublicAccountRole) {
  return role === "jury" ? "/account/jury" : "/account/applicant";
}

/** Only allow an application-local path; reject protocol-relative and external URLs. */
export function safeInternalNext(value: string | null | undefined, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }

  try {
    const url = new URL(value, "https://ibpa.local");
    return url.origin === "https://ibpa.local" ? `${url.pathname}${url.search}${url.hash}` : fallback;
  } catch {
    return fallback;
  }
}

export function safeNextForRole(value: string | null | undefined, role: PublicAccountRole) {
  const fallback = getDashboardPathForPublicRole(role);
  const next = safeInternalNext(value, fallback);
  if (role === "applicant" && next.startsWith("/account/jury")) return fallback;
  if (role === "jury" && next.startsWith("/account/applicant")) return fallback;
  return next;
}

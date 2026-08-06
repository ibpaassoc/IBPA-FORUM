"use server";

import { findAccountForPublicAuth, findPublicAccountsByEmail } from "@/features/account/server/accounts";
import { normalizeAccountEmail } from "@/features/account/server/password";
import { parsePublicAccountRole, toAccountRole, type PublicAccountRole } from "@/features/auth/lib/role";

export type LoginAccountState = {
  error?: string;
  switchRole?: PublicAccountRole;
};

/**
 * Provides actionable pre-login feedback without creating a session. The actual
 * password check and JWT issuance stay inside NextAuth's Credentials provider.
 */
export async function inspectLoginAccountAction(
  emailInput: string,
  requestedRoleInput: string,
): Promise<LoginAccountState> {
  const email = normalizeAccountEmail(emailInput);
  const requestedRole = parsePublicAccountRole(requestedRoleInput);
  if (!email || !email.includes("@")) return { error: "Enter a valid email address." };

  const requested = await findAccountForPublicAuth(email, toAccountRole(requestedRole));
  if (requested?.deletedAt || requested?.status === "DISABLED") {
    return { error: "This account is unavailable. Please contact IBPA support." };
  }
  if (requested && !requested.passwordHash) {
    return { error: "This account setup is incomplete. Use the password setup link from your email." };
  }
  if (requested) return {};

  const otherRole: PublicAccountRole = requestedRole === "jury" ? "applicant" : "jury";
  const accounts = await findPublicAccountsByEmail(email);
  const other = accounts.find((account) => account.role === toAccountRole(otherRole));
  if (other && !other.deletedAt && other.status !== "DISABLED") {
    return {
      error: `No ${requestedRole} account exists for this email. A ${otherRole} account is available instead.`,
      switchRole: otherRole,
    };
  }

  return { error: `No ${requestedRole} account was found for this email.` };
}

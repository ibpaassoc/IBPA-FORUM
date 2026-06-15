import "server-only";

export type MembershipVerificationResult =
  | { verified: true }
  | { verified: false; reason: "ibpa_api_not_configured" | "invalid_cert" | "api_error" };

/**
 * Verifies an IBPA membership certificate number against the IBPA API.
 * Required env vars (when available): IBPA_API_URL, IBPA_API_KEY
 */
export async function verifyIbpaMembership(
  certNumber: string
): Promise<MembershipVerificationResult> {
  // TODO: Integrate with IBPA API when credentials are available.
  // The API endpoint and key will be provided by IBPA associations.
  console.info("IBPA membership verification requested", { certNumber });
  return { verified: false, reason: "ibpa_api_not_configured" };
}

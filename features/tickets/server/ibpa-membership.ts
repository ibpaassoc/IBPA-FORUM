import "server-only";

export type MembershipVerificationResult =
  | { verified: true }
  | { verified: false; reason: "ibpa_api_not_configured" | "invalid_cert" | "api_error" };

export async function verifyIbpaMembership(
  certNumber: string
): Promise<MembershipVerificationResult> {
  const backendUrl = process.env.IBPA_WEB_BACKEND_URL?.replace(/\/+$/, "");

  if (!backendUrl) {
    return { verified: false, reason: "ibpa_api_not_configured" };
  }

  try {
    const res = await fetch(
      `${backendUrl}/api/members/verify-cert?certNumber=${encodeURIComponent(certNumber.trim())}`,
      { next: { revalidate: 0 } }
    );

    if (!res.ok) {
      return { verified: false, reason: "api_error" };
    }

    const data = (await res.json()) as { valid: boolean };
    return data.valid ? { verified: true } : { verified: false, reason: "invalid_cert" };
  } catch {
    return { verified: false, reason: "api_error" };
  }
}

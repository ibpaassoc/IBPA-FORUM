import "server-only";
import crypto from "node:crypto";
import {
  GOOGLE_SHEETS_SCOPE,
  GOOGLE_TOKEN_ENDPOINT,
  type GoogleSheetsConfig,
} from "./config";

/**
 * Service-account authentication for the Google Sheets API.
 *
 * Implemented with Node's native `crypto` (RS256 JWT) + `fetch` against Google's
 * OAuth token endpoint — no extra SDK dependency, which keeps the Vercel bundle
 * small and cold starts fast. The short-lived access token is cached in module
 * scope and reused across warm invocations until shortly before it expires.
 */

type CachedToken = {
  accessToken: string;
  /** Epoch millis after which the token must be refreshed. */
  expiresAt: number;
  /** Identifies which credentials minted the token, so a config change invalidates it. */
  clientEmail: string;
};

let cachedToken: CachedToken | null = null;

function base64Url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function buildSignedAssertion(config: GoogleSheetsConfig, nowSeconds: number): string {
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: config.clientEmail,
    scope: GOOGLE_SHEETS_SCOPE,
    aud: GOOGLE_TOKEN_ENDPOINT,
    iat: nowSeconds,
    exp: nowSeconds + 3600,
  };

  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(
    JSON.stringify(claims)
  )}`;

  const signer = crypto.createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const signature = signer.sign(config.privateKey).toString("base64url");

  return `${unsigned}.${signature}`;
}

/**
 * Return a valid OAuth access token for the configured service account,
 * refreshing it when the cached token is missing or close to expiry.
 */
export async function getAccessToken(config: GoogleSheetsConfig): Promise<string> {
  const now = Date.now();

  if (
    cachedToken &&
    cachedToken.clientEmail === config.clientEmail &&
    cachedToken.expiresAt > now
  ) {
    return cachedToken.accessToken;
  }

  const assertion = buildSignedAssertion(config, Math.floor(now / 1000));

  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Google Sheets token exchange failed (${response.status}): ${detail}`
    );
  }

  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!payload.access_token) {
    throw new Error("Google Sheets token exchange returned no access token.");
  }

  const expiresInMs = (payload.expires_in ?? 3600) * 1000;
  cachedToken = {
    accessToken: payload.access_token,
    // Refresh 60s early to avoid using a token that expires mid-request.
    expiresAt: now + expiresInMs - 60_000,
    clientEmail: config.clientEmail,
  };

  return cachedToken.accessToken;
}

/** Drop the cached access token. Exposed mainly for tests / forced refresh. */
export function resetAccessTokenCache(): void {
  cachedToken = null;
}

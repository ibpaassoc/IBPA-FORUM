import { createHash, randomBytes } from "node:crypto";

const REGISTRATION_TOKEN_TTL_DAYS = 14;

export function hashRegistrationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createRegistrationToken() {
  const rawToken = randomBytes(32).toString("hex");
  const tokenHash = hashRegistrationToken(rawToken);
  const expiresAt = new Date(
    Date.now() + REGISTRATION_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
  );

  return {
    rawToken,
    tokenHash,
    expiresAt,
  };
}

import { timingSafeEqual } from "node:crypto";

const ACCESS_TOKEN_ENV_NAMES = [
  "JURY_APPLICATION_ACCESS_TOKEN",
  "JURY_APPLY_ACCESS_TOKEN",
];

export function getJuryApplyAccessToken() {
  for (const name of ACCESS_TOKEN_ENV_NAMES) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }

  return "";
}

export function isValidJuryApplyAccessToken(token: string | null | undefined) {
  const expectedToken = getJuryApplyAccessToken();
  const candidateToken = token?.trim() ?? "";

  if (!expectedToken || !candidateToken) {
    return false;
  }

  const expected = Buffer.from(expectedToken);
  const candidate = Buffer.from(candidateToken);

  return expected.length === candidate.length && timingSafeEqual(expected, candidate);
}

import { timingSafeEqual } from "node:crypto";

export function getApplicationAccessToken() {
  return process.env.APPLICATION_ACCESS_TOKEN?.trim() ?? "";
}

export function isValidApplicationAccessToken(
  token: string | null | undefined,
) {
  const expectedToken = getApplicationAccessToken();
  const candidateToken = token?.trim() ?? "";

  if (!expectedToken || !candidateToken) {
    return false;
  }

  const expected = Buffer.from(expectedToken);
  const candidate = Buffer.from(candidateToken);

  return expected.length === candidate.length && timingSafeEqual(expected, candidate);
}

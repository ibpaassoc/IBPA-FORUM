import "server-only";
import QRCode from "qrcode";
import type { TicketKind } from "../types";

/**
 * Unified QR payload format: `IBPA:<KIND>:<token>`.
 *
 * Backward compatibility:
 *   - `IBPA-TICKET:<secureToken>` — the original forum/gala ticket format that
 *     is already printed on emailed tickets.
 *   - a bare token with no prefix — treated as an unknown kind and resolved by
 *     trying each source table.
 */

const PREFIX = "IBPA:";
const LEGACY_TICKET_PREFIX = "IBPA-TICKET:";

// Tokens are cuids (record ids) or 64-char hex secure tokens. Cap the accepted
// length and charset so malformed / oversized QR payloads are rejected cheaply.
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;

export type ParsedScan = {
  /** Null when the kind could not be determined from the payload. */
  kind: TicketKind | null;
  token: string;
};

export function buildScanPayload(kind: TicketKind, token: string): string {
  return `${PREFIX}${kind}:${token}`;
}

function isTicketKind(value: string): value is TicketKind {
  return value === "TICKET" || value === "PARTICIPANT" || value === "JURY";
}

/**
 * Parse a raw scanned string into a kind + token. Returns null when the payload
 * is malformed (empty, wrong shape, illegal characters, too long) so callers
 * can reject it without touching the database.
 */
export function parseScanCode(raw: unknown): ParsedScan | null {
  if (typeof raw !== "string") return null;

  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 256) return null;

  if (trimmed.startsWith(PREFIX)) {
    const rest = trimmed.slice(PREFIX.length);
    const sep = rest.indexOf(":");
    if (sep <= 0) return null;
    const kindPart = rest.slice(0, sep);
    const token = rest.slice(sep + 1);
    if (!isTicketKind(kindPart) || !TOKEN_PATTERN.test(token)) return null;
    return { kind: kindPart, token };
  }

  if (trimmed.startsWith(LEGACY_TICKET_PREFIX)) {
    const token = trimmed.slice(LEGACY_TICKET_PREFIX.length);
    if (!TOKEN_PATTERN.test(token)) return null;
    return { kind: "TICKET", token };
  }

  // Bare token — unknown kind, resolver will try each source.
  if (TOKEN_PATTERN.test(trimmed)) {
    return { kind: null, token: trimmed };
  }

  return null;
}

export async function generateScanQrBuffer(payload: string): Promise<Buffer> {
  return QRCode.toBuffer(payload, {
    type: "png",
    width: 300,
    margin: 2,
    color: { dark: "#252a2d", light: "#ffffff" },
  });
}

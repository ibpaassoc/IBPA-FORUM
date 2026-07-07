/**
 * Scan-mode logic shared by the client scanner UI and the server check-in
 * service. Pure functions only — no DB, no i18n, so it is safe to import from
 * both "use client" components and server modules.
 *
 * A scan mode ("one_day" | "two_day" | "gala_dinner") gates which forum tickets
 * an operator may check in. Copy/labels for these modes live in `adminT.scanner`.
 */

import { SCAN_MODES, type CheckInScope, type ScanMode } from "./types";

export function isScanMode(value: unknown): value is ScanMode {
  return (
    typeof value === "string" &&
    (SCAN_MODES as readonly string[]).includes(value)
  );
}

/**
 * The forum-ticket check-in scope a scan mode records against. Day passes
 * (`one_day`/`two_day`) share the single FORUM entry scope; `gala_dinner`
 * records against the separate GALA scope.
 */
export function scanModeScope(mode: ScanMode): Extract<CheckInScope, "FORUM" | "GALA"> {
  return mode === "gala_dinner" ? "GALA" : "FORUM";
}

/**
 * The scan modes a forum ticket qualifies for, derived from its raw stored
 * values. A 2-day pass with gala dinner returns `["two_day", "gala_dinner"]`.
 *
 * Backward compatible: unknown/legacy `type` values simply contribute no day
 * pass, so an old ticket still qualifies for `gala_dinner` when the flag is set
 * and is never crashed by an unexpected type string.
 */
export function ticketAccessTypes(type: string, galaDinner: boolean): ScanMode[] {
  const modes: ScanMode[] = [];
  if (type === "ONE_DAY") modes.push("one_day");
  if (type === "TWO_DAYS") modes.push("two_day");
  if (galaDinner) modes.push("gala_dinner");
  return modes;
}

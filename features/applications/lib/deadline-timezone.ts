export const APPLICANT_DEADLINE_TIME_ZONE = "America/Los_Angeles";

function getTimeZoneParts(value: Date, timeZone = APPLICANT_DEADLINE_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(value);

  return Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  ) as Record<"year" | "month" | "day" | "hour" | "minute" | "second", string>;
}

function getTimeZoneOffsetMs(value: Date, timeZone = APPLICANT_DEADLINE_TIME_ZONE) {
  const parts = getTimeZoneParts(value, timeZone);
  const zonedAsUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );

  return zonedAsUtc - value.getTime();
}

export function formatDateTimeLocalInApplicantDeadlineZone(
  value: Date | null | undefined,
) {
  if (!value) return "";
  const parts = getTimeZoneParts(value);
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

export function parseApplicantDeadlineDateTimeLocal(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(trimmed);
  if (!match) return undefined;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] ?? "0");
  const localAsUtc = Date.UTC(year, month - 1, day, hour, minute, second);

  if (
    !Number.isFinite(localAsUtc) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    return undefined;
  }

  const firstPass = localAsUtc - getTimeZoneOffsetMs(new Date(localAsUtc));
  const resolved = localAsUtc - getTimeZoneOffsetMs(new Date(firstPass));
  const date = new Date(resolved);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

export function formatApplicantDeadlinePart(
  value: Date,
  locale: string,
  options: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: APPLICANT_DEADLINE_TIME_ZONE,
  }).format(value);
}

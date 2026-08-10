export function reserveRateLimitSlot({
  now,
  nextStartAt,
  maxStartsPerSecond,
}: {
  now: number;
  nextStartAt: number;
  maxStartsPerSecond: number;
}) {
  const intervalMs = Math.ceil(1000 / Math.max(1, maxStartsPerSecond));
  const scheduledAt = Math.max(now, nextStartAt);
  return {
    delayMs: Math.max(0, scheduledAt - now),
    nextStartAt: scheduledAt + intervalMs,
  };
}

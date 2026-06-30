/**
 * `pg-connection-string` (used by `pg`) currently treats the SSL modes
 * `prefer`, `require`, and `verify-ca` as aliases for `verify-full`, and warns
 * that this will change in pg v9. We normalise those modes to the explicit
 * `verify-full` so the connection keeps its current behaviour without the noisy
 * deprecation warning. Other modes (including `disable`/`no-verify`) are left
 * untouched. On any parse failure the original string is returned unchanged.
 */
export function normalizeSslMode(connectionString: string | undefined) {
  if (!connectionString) return connectionString;
  try {
    const url = new URL(connectionString);
    const sslmode = url.searchParams.get("sslmode");
    if (sslmode === "prefer" || sslmode === "require" || sslmode === "verify-ca") {
      url.searchParams.set("sslmode", "verify-full");
      return url.toString();
    }
    return connectionString;
  } catch {
    return connectionString;
  }
}

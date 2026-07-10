import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTH_SECRET =
  process.env.NEXTAUTH_SECRET ??
  process.env.AUTH_SECRET ??
  "beauty-web-dev-jury-auth-secret";

function isPublicFile(pathname: string) {
  return /\.[^/]+$/.test(pathname);
}

function isProtectedJuryPath(pathname: string) {
  return pathname === "/jury/dashboard" || pathname.startsWith("/jury/dashboard/");
}

// Routes accessible during the site-wide maintenance lock.
// All other page routes are rewritten to /under-development.
const ALLOWED_PATH_PREFIXES = [
  "/",
  "/association",
  "/apply",
  "/categories",
  "/grand-prix",
  "/jury",
  "/under-development",
  // Admin panel — staff must still review applications
  "/admin",
  // Jury member area
  "/jury/dashboard",
  "/jury/login",
  "/jury/register",
  "/jury/forgot-password",
  "/jury/reset-password",
  // General auth
  "/login",
  "/register",
];

function isSiteLockAllowed(pathname: string) {
  return ALLOWED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always pass through: Next.js internals, API routes, static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    isPublicFile(pathname)
  ) {
    return NextResponse.next();
  }

  // Site-wide maintenance lock: rewrite disallowed routes to /under-development
  // Skip lock in dev mode
  const devMode = process.env.DEV_MODE === "true" || process.env.DEV_MODE === "True";
  if (!devMode && !isSiteLockAllowed(pathname)) {
    return NextResponse.rewrite(new URL("/under-development", request.url));
  }

  // Protect /jury/dashboard with JWT auth
  if (isProtectedJuryPath(pathname)) {
    const token = await getToken({
      req: request,
      secret: AUTH_SECRET,
    });

    if (!token) {
      return NextResponse.redirect(new URL("/jury/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

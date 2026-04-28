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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname === "/favicon.ico" ||
    isPublicFile(pathname)
  ) {
    return NextResponse.next();
  }

  if (!isProtectedJuryPath(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: AUTH_SECRET,
  });

  if (!token) {
    return NextResponse.redirect(new URL("/jury/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

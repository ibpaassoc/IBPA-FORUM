import "server-only";

import crypto from "node:crypto";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

const TEST_SESSION_COOKIE = "ibpa-test-session";
const TEST_ACTOR_COOKIE = "ibpa-test-actor";
const SESSION_TTL_SECONDS = 8 * 60 * 60;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;

type TestSessionPayload = {
  issuedAt: number;
  expiresAt: number;
  nonce: string;
};

export type TestActor = {
  accountId: string;
  role: "APPLICANT" | "JURY";
  expiresAt: number;
};

type RateLimitEntry = {
  attempts: number;
  resetAt: number;
};

const globalForTestAuth = globalThis as typeof globalThis & {
  ibpaTestLoginAttempts?: Map<string, RateLimitEntry>;
};

const loginAttempts =
  globalForTestAuth.ibpaTestLoginAttempts ?? new Map<string, RateLimitEntry>();

if (process.env.NODE_ENV !== "production") {
  globalForTestAuth.ibpaTestLoginAttempts = loginAttempts;
}

function configuredPassword() {
  const password = process.env.TEST_PASSWORD?.trim();
  return password || null;
}

function sessionSecret(password: string) {
  return crypto
    .createHash("sha256")
    .update(`ibpa-test-session:${password}:${process.env.NEXTAUTH_SECRET ?? ""}`)
    .digest();
}

function signPayload(encodedPayload: string, password: string) {
  return crypto
    .createHmac("sha256", sessionSecret(password))
    .update(encodedPayload)
    .digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftHash = crypto.createHash("sha256").update(left).digest();
  const rightHash = crypto.createHash("sha256").update(right).digest();
  return crypto.timingSafeEqual(leftHash, rightHash);
}

function parseSession(token: string, password: string): TestSessionPayload | null {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;
  if (!safeEqual(signature, signPayload(encodedPayload, password))) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as TestSessionPayload;
    if (
      typeof payload.issuedAt !== "number" ||
      typeof payload.expiresAt !== "number" ||
      typeof payload.nonce !== "string" ||
      payload.expiresAt <= Date.now() ||
      payload.issuedAt > Date.now() + 60_000
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function isTestSystemAvailable() {
  return configuredPassword() !== null;
}

export async function getTestSession() {
  const password = configuredPassword();
  if (!password) return null;
  const token = (await cookies()).get(TEST_SESSION_COOKIE)?.value;
  if (!token) return null;
  return parseSession(token, password);
}

export async function requireTestSession() {
  if (!isTestSystemAvailable()) notFound();
  const session = await getTestSession();
  if (!session) redirect("/test/login");
  return session;
}

export async function requestRateLimitKey() {
  const requestHeaders = await headers();
  return (
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "unknown"
  );
}

export function consumeLoginAttempt(key: string) {
  const now = Date.now();
  const current = loginAttempts.get(key);
  if (!current || current.resetAt <= now) {
    loginAttempts.set(key, { attempts: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (current.attempts >= RATE_LIMIT_MAX_ATTEMPTS) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }
  current.attempts += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

export function clearLoginAttempts(key: string) {
  loginAttempts.delete(key);
}

export function verifyTestPassword(candidate: string) {
  const password = configuredPassword();
  return Boolean(password && safeEqual(candidate, password));
}

export async function createTestSession() {
  const password = configuredPassword();
  if (!password) notFound();
  const now = Date.now();
  const payload: TestSessionPayload = {
    issuedAt: now,
    expiresAt: now + SESSION_TTL_SECONDS * 1000,
    nonce: crypto.randomBytes(18).toString("base64url"),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const token = `${encodedPayload}.${signPayload(encodedPayload, password)}`;
  (await cookies()).set(TEST_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroyTestSession() {
  (await cookies()).set(TEST_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
  (await cookies()).set(TEST_ACTOR_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

export async function createTestActor(actor: Omit<TestActor, "expiresAt">) {
  await requireTestSession();
  const password = configuredPassword();
  if (!password) notFound();
  const payload: TestActor = {
    ...actor,
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signPayload(`actor:${encodedPayload}`, password);
  (await cookies()).set(TEST_ACTOR_COOKIE, `${encodedPayload}.${signature}`, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function getTestActor(): Promise<TestActor | null> {
  const password = configuredPassword();
  if (!password || !(await getTestSession())) return null;
  const token = (await cookies()).get(TEST_ACTOR_COOKIE)?.value;
  if (!token) return null;
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;
  if (!safeEqual(signature, signPayload(`actor:${encodedPayload}`, password))) return null;
  try {
    const actor = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as TestActor;
    if (
      !actor.accountId ||
      (actor.role !== "APPLICANT" && actor.role !== "JURY") ||
      actor.expiresAt <= Date.now()
    ) {
      return null;
    }
    return actor;
  } catch {
    return null;
  }
}

export async function destroyTestActor() {
  (await cookies()).set(TEST_ACTOR_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}

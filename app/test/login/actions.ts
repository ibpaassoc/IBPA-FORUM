"use server";

import { redirect } from "next/navigation";
import {
  clearLoginAttempts,
  consumeLoginAttempt,
  createTestSession,
  isTestSystemAvailable,
  requestRateLimitKey,
  verifyTestPassword,
} from "@/features/test/server/auth";

export async function loginToTestSystem(formData: FormData) {
  if (!isTestSystemAvailable()) redirect("/404");
  const key = await requestRateLimitKey();
  const limit = consumeLoginAttempt(key);
  if (!limit.allowed) {
    redirect(`/test/login?error=rate_limited&retry=${limit.retryAfterSeconds}`);
  }

  const candidate = String(formData.get("password") ?? "");
  if (!verifyTestPassword(candidate)) {
    redirect("/test/login?error=invalid_password");
  }

  clearLoginAttempts(key);
  await createTestSession();
  redirect("/test");
}

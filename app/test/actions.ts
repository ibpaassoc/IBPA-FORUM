"use server";

import { redirect } from "next/navigation";
import { destroyTestSession, requireTestSession } from "@/features/test/server/auth";

export async function logoutOfTestSystem() {
  await requireTestSession();
  await destroyTestSession();
  redirect("/test/login");
}


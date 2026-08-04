"use server";

import { redirect } from "next/navigation";
import { destroyTestActor, destroyTestSession, requireTestSession } from "@/features/test/server/auth";

export async function logoutOfTestSystem() {
  await requireTestSession();
  await destroyTestSession();
  redirect("/test/login");
}

export async function stopTestActorAction() {
  await requireTestSession();
  await destroyTestActor();
  redirect("/test");
}

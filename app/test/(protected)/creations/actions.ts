"use server";

import { redirect } from "next/navigation";
import { requireTestSession } from "@/features/test/server/auth";
import { deleteAllTestData, deleteOneTestEntity, deleteTestScenario, type TestEntityType } from "@/features/test/server/cleanup";

const entityTypes = new Set<TestEntityType>(["account", "nomination", "review", "ticket", "email"]);

export async function deleteTestScenarioAction(formData: FormData) {
  await requireTestSession();
  const scenarioId = String(formData.get("scenarioId") ?? "");
  const summary = await deleteTestScenario(scenarioId);
  redirect(`/test/creations?deleted=scenario&count=${summary.total}&blobs=${summary.blobsDeleted}`);
}
export async function deleteOneTestEntityAction(formData: FormData) {
  await requireTestSession();
  const type = String(formData.get("entityType") ?? "") as TestEntityType;
  const id = String(formData.get("entityId") ?? "");
  if (!entityTypes.has(type)) throw new Error("Unsupported test entity type.");
  await deleteOneTestEntity(type, id);
  redirect(`/test/creations?deleted=${type}&count=1`);
}

export async function deleteAllTestDataAction(formData: FormData) {
  await requireTestSession();
  if (String(formData.get("confirmation") ?? "") !== "DELETE ALL TEST DATA") {
    throw new Error("Enter DELETE ALL TEST DATA exactly to confirm cleanup.");
  }
  const summary = await deleteAllTestData();
  redirect(`/test/creations?deleted=all&count=${summary.total}&blobs=${summary.blobsDeleted}`);
}

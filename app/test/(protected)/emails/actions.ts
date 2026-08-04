"use server";

import { redirect } from "next/navigation";
import { requireTestSession } from "@/features/test/server/auth";
import { EMAIL_TEST_CATALOG, sendCatalogEmail } from "@/features/test/server/email-catalog";

function parseInputs(value: FormDataEntryValue | null) {
  try {
    const parsed = JSON.parse(String(value ?? "{}")) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    return parsed as Record<string, unknown>;
  } catch {
    throw new Error("Template inputs must be a valid JSON object.");
  }
}
export async function sendTestEmailAction(formData: FormData) {
  await requireTestSession();
  const templateId = String(formData.get("templateId") ?? "");
  const recipient = String(formData.get("recipient") ?? "").trim();
  const result = await sendCatalogEmail({ templateId, recipient, inputs: parseInputs(formData.get("inputs")) });
  redirect(`/test/emails?sent=${result.delivered ? "1" : "0"}&template=${encodeURIComponent(templateId)}`);
}

export async function sendTestEmailSequenceAction(formData: FormData) {
  await requireTestSession();
  const recipient = String(formData.get("recipient") ?? "").trim();
  const selected = new Set(formData.getAll("templateIds").map(String));
  const entries = EMAIL_TEST_CATALOG.filter((entry) => selected.has(entry.id));
  if (entries.length === 0) throw new Error("Select at least one email for the sequence.");
  let delivered = 0;
  for (const entry of entries) {
    const result = await sendCatalogEmail({ templateId: entry.id, recipient, inputs: entry.defaultInputs });
    if (result.delivered) delivered += 1;
  }
  redirect(`/test/emails?sequence=${entries.length}&delivered=${delivered}`);
}

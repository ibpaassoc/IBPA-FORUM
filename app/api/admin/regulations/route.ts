import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  isRegulationKey,
  isRegulationLanguage,
} from "@/features/regulations/types";
import {
  getExpectedRegulationTarget,
  resolveRegulationUrl,
  setRegulationUrl,
} from "@/features/regulations/server/queries";
import {
  deleteRegulationBlob,
  inspectRegulationBlob,
} from "@/features/regulations/server/storage";
import { regulationBlobPath } from "@/features/regulations/config";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";

async function authorize() {
  return isAdminAuthenticated();
}

function readIdentity(body: Record<string, unknown>) {
  const { key, categoryId, language } = body;
  if (
    !isRegulationKey(key) ||
    !isRegulationLanguage(language) ||
    !(categoryId === null || typeof categoryId === "string")
  ) {
    return null;
  }
  return { key, categoryId, language };
}

export async function PUT(request: Request) {
  if (!(await authorize())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const identity = readIdentity(body);
    if (!identity || typeof body.url !== "string") {
      return NextResponse.json({ error: "Invalid regulation data." }, { status: 400 });
    }

    const target = await getExpectedRegulationTarget(identity);
    if (!target) {
      return NextResponse.json({ error: "Regulation target was not found." }, { status: 404 });
    }

    const blob = await inspectRegulationBlob(body.url);
    const expectedPath = regulationBlobPath(target.storageScope, identity.language);
    if (blob.pathname !== expectedPath || blob.contentType !== "application/pdf") {
      return NextResponse.json({ error: "Uploaded Blob does not match this regulation." }, { status: 400 });
    }

    await setRegulationUrl({ ...identity, url: body.url });
    revalidatePath("/apply");
    revalidatePath("/admin/regulations");

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not save the regulation." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  if (!(await authorize())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const identity = readIdentity(body);
    if (!identity) {
      return NextResponse.json({ error: "Invalid regulation data." }, { status: 400 });
    }

    const target = await getExpectedRegulationTarget(identity);
    if (!target) {
      return NextResponse.json({ error: "Regulation target was not found." }, { status: 404 });
    }

    const existing = await resolveRegulationUrl({
      key: identity.key,
      language: identity.language,
      exact: true,
    });
    if (!existing) return NextResponse.json({ ok: true });

    await setRegulationUrl({ ...identity, url: null });
    try {
      await deleteRegulationBlob(existing.url);
    } catch (error) {
      await setRegulationUrl({ ...identity, url: existing.url });
      throw error;
    }

    revalidatePath("/apply");
    revalidatePath("/admin/regulations");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not delete the regulation." },
      { status: 500 },
    );
  }
}

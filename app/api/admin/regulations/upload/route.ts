import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import {
  isRegulationKey,
  isRegulationLanguage,
} from "@/features/regulations/types";
import { getExpectedRegulationTarget } from "@/features/regulations/server/queries";
import {
  MAX_REGULATION_PDF_BYTES,
  regulationBlobPath,
} from "@/features/regulations/config";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";

type UploadPayload = {
  key: unknown;
  categoryId: unknown;
  language: unknown;
};

function parsePayload(value: string | null): UploadPayload | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as UploadPayload;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as HandleUploadBody;
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = parsePayload(clientPayload);
        if (
          !payload ||
          !isRegulationKey(payload.key) ||
          !isRegulationLanguage(payload.language) ||
          !(payload.categoryId === null || typeof payload.categoryId === "string")
        ) {
          throw new Error("Invalid regulation upload payload.");
        }

        const target = await getExpectedRegulationTarget({
          key: payload.key,
          categoryId: payload.categoryId,
        });
        if (!target || pathname !== regulationBlobPath(target.storageScope, payload.language)) {
          throw new Error("Invalid regulation upload path.");
        }

        return {
          allowedContentTypes: ["application/pdf"],
          maximumSizeInBytes: MAX_REGULATION_PDF_BYTES,
          addRandomSuffix: false,
          allowOverwrite: true,
          cacheControlMaxAge: 60,
        };
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 400 },
    );
  }
}

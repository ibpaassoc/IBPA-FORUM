import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { requireEditableNomination } from "@/features/account/server/nomination-guards";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";

type UploadClientPayload = {
  nominationId: string;
  fieldKey: string;
};

function parseClientPayload(clientPayload: string | null): UploadClientPayload {
  const parsed = JSON.parse(clientPayload ?? "{}") as Partial<UploadClientPayload>;
  if (
    typeof parsed.nominationId !== "string" ||
    !/^[a-zA-Z0-9_-]+$/.test(parsed.nominationId) ||
    typeof parsed.fieldKey !== "string" ||
    !/^[a-zA-Z0-9_-]+$/.test(parsed.fieldKey)
  ) {
    throw new Error("Invalid upload request.");
  }

  return {
    nominationId: parsed.nominationId,
    fieldKey: parsed.fieldKey,
  };
}

function assertUploadPath(
  pathname: string,
  { nominationId, fieldKey }: UploadClientPayload,
) {
  const prefix = `applications/${nominationId}/${fieldKey}/`;
  const filename = pathname.slice(prefix.length);
  if (
    !pathname.startsWith(prefix) ||
    !filename ||
    filename.length > 180 ||
    filename.includes("/") ||
    filename === "." ||
    filename === ".."
  ) {
    throw new Error("Invalid upload path.");
  }
}

// Client-driven upload handler for participant application files. The browser
// uploads directly to Vercel Blob and only sends the resulting metadata to
// the nomination save endpoint, keeping that request well under Vercel's body
// limit.
export async function POST(request: Request) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  let nominationId: string | undefined;
  try {
    const body = (await request.json()) as HandleUploadBody;
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const uploadRequest = parseClientPayload(clientPayload);
        nominationId = uploadRequest.nominationId;
        assertUploadPath(pathname, uploadRequest);

        let nominationContext;
        try {
          nominationContext = await requireEditableNomination(
            uploadRequest.nominationId,
          );
        } catch {
          throw new Error("You are not allowed to upload files for this nomination.");
        }

        if (nominationContext.nomination.paymentStatus !== "PAID") {
          throw new Error("Files can only be uploaded for a paid nomination.");
        }

        const field = (
          categoryFieldConfigs[nominationContext.nomination.category.slug] ?? []
        ).find(
          (candidate) =>
            candidate.type === "file" &&
            candidate.key === uploadRequest.fieldKey,
        );

        if (!field?.accept?.length) {
          throw new Error("This nomination field does not accept uploads.");
        }

        return {
          allowedContentTypes: field.accept,
          maximumSizeInBytes: (field.maxFileSizeMb ?? 5) * 1024 * 1024,
          addRandomSuffix: true,
          allowOverwrite: false,
          validUntil: Date.now() + 10 * 60 * 1000,
        };
      },
      onUploadCompleted: async () => {
        // Blob metadata is recorded during the main form submission.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Applicant nomination upload authorization failed", {
      nominationId: nominationId ?? "unknown",
      requestId,
      code: error instanceof Response && error.status === 401 ? "AUTHENTICATION" : "UPLOAD",
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    return NextResponse.json(
      { errorCode: "UPLOAD", requestId, error: "Unable to start this upload. Please retry." },
      { status: 400, headers: { "X-Request-Id": requestId } }
    );
  }
}

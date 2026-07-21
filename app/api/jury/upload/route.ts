import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isValidJuryApplyAccessToken } from "@/lib/jury/apply-access";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";
import { prisma } from "@/shared/lib/prisma";

async function hasValidAdditionalInfoToken(token: string | null) {
  if (!token) return false;

  const application = await prisma.juryApplication.findUnique({
    where: { infoRequestToken: token },
    select: { status: true },
  });

  return application?.status === "ADDITIONAL_INFO_REQUIRED";
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const hasAccess =
    isValidJuryApplyAccessToken(searchParams.get("token")) ||
    (await hasValidAdditionalInfoToken(searchParams.get("infoToken"))) ||
    (await isAdminAuthenticated());

  if (!hasAccess) {
    return NextResponse.json(
      { error: "This jury application link is invalid or no longer available." },
      { status: 403 }
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!pathname.startsWith("jury/")) {
          throw new Error("Invalid upload path.");
        }
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf",
          ],
          maximumSizeInBytes: 25 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // Blob metadata is recorded during main form submission.
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}

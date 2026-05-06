import { NextRequest, NextResponse } from "next/server";
import { saveApplicationSubmission } from "@/features/applications/server/commands";
import { EnvConfigError, isProduction, validateProductionEnv } from "@/lib/env";
import { prisma } from "@/shared/lib/prisma";

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unknown server error.";
}

export async function GET() {
  try {
    const applications = await prisma.application.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: true,
        award: true,
        files: true,
        answers: true,
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("GET /api/applications error:", error);

    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  console.info("POST /api/applications called", {
    url: request.url,
    contentType: request.headers.get("content-type"),
  });

  try {
    validateProductionEnv([
      { names: ["DATABASE_URL"] },
      { names: ["BLOB_READ_WRITE_TOKEN"] },
      { names: ["STRIPE_SECRET_KEY"], ascii: true },
      { names: ["APP_URL", "FRONTEND_URL", "NEXT_PUBLIC_APP_URL"] },
    ]);

    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      console.warn("POST /api/applications invalid content type", {
        contentType,
      });
      return NextResponse.json(
        {
          message:
            "Participant applications must be submitted as multipart form data.",
        },
        { status: 415 }
      );
    }
    const formData = await request.formData();
    console.info("POST /api/applications form data received", {
      keys: Array.from(new Set(Array.from(formData.keys()))),
      fileFields: Array.from(formData.entries())
        .filter(([, value]) => value instanceof File)
        .map(([key, value]) => ({
          key,
          size: value instanceof File ? value.size : 0,
          type: value instanceof File ? value.type : "",
        })),
    });

    const result = await saveApplicationSubmission(formData);

    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("POST /api/applications error:", error);
    const devMessage =
      error instanceof EnvConfigError
        ? error.message
        : `Failed to create application: ${getErrorMessage(error)}`;

    return NextResponse.json(
      {
        message: isProduction()
          ? "Something went wrong during submission. Please try again in a moment."
          : devMessage,
      },
      { status: 500 }
    );
  }
}

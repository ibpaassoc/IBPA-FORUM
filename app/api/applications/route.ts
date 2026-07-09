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

function getSubmissionErrorCode(error: unknown) {
  const message = getErrorMessage(error).toLowerCase();

  if (error instanceof EnvConfigError) {
    return "ENV_CONFIG";
  }

  if (message.includes("stripe")) {
    return "STRIPE_CHECKOUT";
  }

  if (message.includes("blob") || message.includes("upload")) {
    return "FILE_UPLOAD";
  }

  if (message.includes("prisma") || message.includes("database")) {
    return "DATABASE";
  }

  return "SUBMISSION_ERROR";
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

    // Files must be uploaded to Vercel Blob first (POST /api/applications/upload)
    // and referenced by metadata. Raw File objects here would balloon the request
    // body past Vercel's limit (the 413 this endpoint used to hit), so reject them
    // with a helpful 400 instead of letting the platform drop the request.
    const rawFileFields = Array.from(formData.entries())
      .filter(([, value]) => value instanceof File)
      .map(([key, value]) => ({
        key,
        size: value instanceof File ? value.size : 0,
        type: value instanceof File ? value.type : "",
      }));

    if (rawFileFields.length > 0) {
      console.warn("POST /api/applications rejected raw file payload", {
        rawFileFields,
      });
      return NextResponse.json(
        {
          errorCode: "RAW_FILE_REJECTED",
          message:
            "Files must be uploaded before submitting. Please reload the application form and try again.",
        },
        { status: 400 }
      );
    }

    console.info("POST /api/applications form data received", {
      keys: Array.from(new Set(Array.from(formData.keys()))),
    });

    const result = await saveApplicationSubmission(formData);

    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    const errorCode = getSubmissionErrorCode(error);
    console.error("POST /api/applications error:", error);
    const devMessage =
      error instanceof EnvConfigError
        ? error.message
        : `Failed to create application: ${getErrorMessage(error)}`;

    return NextResponse.json(
      {
        errorCode,
        message: isProduction()
          ? "Something went wrong during submission. Please try again in a moment."
          : devMessage,
      },
      { status: 500 }
    );
  }
}

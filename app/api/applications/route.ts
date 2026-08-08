import { NextRequest, NextResponse } from "next/server";
import {
  ApplicantPurchaseError,
  createPublicApplicantNominationCheckout,
} from "@/features/applications/server/purchase-workflow";
import { EnvConfigError, isProduction, validateProductionEnv } from "@/lib/env";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";
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
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const applications = await prisma.applicantProfile.findMany({
      where: { account: { status: { not: "DISABLED" } } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        city: true,
        country: true,
        account: { select: { email: true, status: true } },
        nominations: {
          where: { status: { not: "ARCHIVED" } },
          select: {
            id: true,
            status: true,
            payment: { select: { status: true } },
            submittedAt: true,
            category: { select: { name: true } },
            award: { select: { name: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json(
      applications.map((application) => ({
        ...application,
        nominations: application.nominations.map((nomination) => ({
          ...nomination,
          paymentStatus: nomination.payment.status,
          payment: undefined,
        })),
      }))
    );
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
            "The purchase form does not accept files. Files can be added from the applicant account after payment.",
        },
        { status: 400 }
      );
    }

    console.info("POST /api/applications form data received", {
      keys: Array.from(new Set(Array.from(formData.keys()))),
    });

    const result = await createPublicApplicantNominationCheckout(formData);

    return NextResponse.json(
      {
        message: "Redirecting to secure Stripe Checkout.",
        paymentId: result.paymentId,
        checkoutUrl: result.checkoutUrl,
        amount: result.amount,
        currency: result.currency,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ApplicantPurchaseError) {
      return NextResponse.json(
        {
          errorCode: error.code,
          message: error.message,
          fieldErrors: error.fieldErrors,
        },
        { status: error.status }
      );
    }

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

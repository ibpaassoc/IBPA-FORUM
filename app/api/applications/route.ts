import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveApplicationSubmission } from "@/lib/apply/server";

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
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        {
          error:
            "Participant applications must be submitted as multipart form data.",
        },
        { status: 415 }
      );
    }
    const formData = await request.formData();
    const result = await saveApplicationSubmission(formData);

    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    console.error("POST /api/applications error:", error);

    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}

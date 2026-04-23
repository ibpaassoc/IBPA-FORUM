import { NextResponse } from "next/server";
import { submitJuryApplication } from "@/features/jury/server/commands";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await submitJuryApplication(formData);

    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          message: "You already submitted the application.",
        },
        { status: 409 }
      );
    }

    console.error("Failed to submit jury application", error);

    return NextResponse.json(
      {
        message:
          "We could not submit the jury application right now. Please try again.",
      },
      { status: 500 }
    );
  }
}

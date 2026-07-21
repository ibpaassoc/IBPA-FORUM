import { NextResponse } from "next/server";
import { draftReviewSchema } from "@/features/jury/schemas/review.schema";
import {
  getAuthenticatedJuryApiContext,
  saveJuryReviewDraft,
} from "@/features/jury/server/reviews";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ nominationId: string }> }
) {
  try {
    const judge = await getAuthenticatedJuryApiContext();
    const { nominationId } = await params;
    const parsed = draftReviewSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: parsed.error.issues[0]?.message ?? "Invalid draft score payload.",
        },
        { status: 400 }
      );
    }

    const review = await saveJuryReviewDraft({
      judge,
      nominationId,
      input: parsed.data,
    });

    return NextResponse.json(review);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      typeof error.status === "number"
    ) {
      return NextResponse.json(
        { message: error instanceof Error ? error.message : "Request failed." },
        { status: error.status }
      );
    }

    console.error("POST /api/account/jury/nominations/[nominationId]/draft error:", error);
    return NextResponse.json({ message: "Failed to save review draft." }, { status: 500 });
  }
}

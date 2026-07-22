import { NextResponse } from "next/server";
import {
  getAuthenticatedJuryApiContext,
  getJuryNominationWorkspace,
  type JuryNominationFilter,
} from "@/features/jury/server/reviews";

export async function GET(request: Request) {
  try {
    const judge = await getAuthenticatedJuryApiContext();
    const url = new URL(request.url);
    const category = url.searchParams.get("category") ?? undefined;
    const requestedStatus = url.searchParams.get("status");
    const status: JuryNominationFilter =
      requestedStatus === "pending" ||
      requestedStatus === "in-progress" ||
      requestedStatus === "completed"
        ? requestedStatus
        : "all";
    const data = await getJuryNominationWorkspace({
      judge,
      category,
      status,
    });

    return NextResponse.json(data);
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

    console.error("GET /api/account/jury/nominations error:", error);
    return NextResponse.json({ message: "Failed to load nominations." }, { status: 500 });
  }
}

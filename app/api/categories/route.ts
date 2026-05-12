import { NextResponse } from "next/server";
import { getApplicationCategories } from "@/features/applications/server/queries";

export async function GET() {
  try {
    const categories = await getApplicationCategories();

    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET /api/directions error:", error);

    return NextResponse.json(
      { error: "Failed to fetch directions" },
      { status: 500 }
    );
  }
}

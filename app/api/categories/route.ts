import { NextResponse } from "next/server";
import { getApplicationCategories } from "@/features/applications/server/queries";

// Nominations are read live from the DB; never serve a cached snapshot so
// newly added Award rows appear immediately.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categories = await getApplicationCategories();

    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET /api/categories error:", error);

    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

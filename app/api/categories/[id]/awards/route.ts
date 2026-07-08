import { NextResponse } from "next/server";
import { getApplicationCategories } from "@/features/applications/server/queries";

// Nominations are read live from the DB; never serve a cached snapshot so
// newly added Award rows appear immediately.
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categories = await getApplicationCategories();
    const awards =
      categories.find((category) => category.id === id)?.awards ?? [];

    return NextResponse.json(awards);
  } catch (error) {
    console.error("GET /api/categories/[id]/nominations error:", error);

    return NextResponse.json(
      { error: "Failed to fetch nominations" },
      { status: 500 }
    );
  }
}

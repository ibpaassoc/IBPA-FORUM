import { NextResponse } from "next/server";
import { getApplicationCategories } from "@/lib/apply/server";

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
    console.error("GET /api/categories/[id]/awards error:", error);

    return NextResponse.json(
      { error: "Failed to fetch awards" },
      { status: 500 }
    );
  }
}

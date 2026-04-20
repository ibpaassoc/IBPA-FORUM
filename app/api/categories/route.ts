import { NextResponse } from "next/server";
import { getApplicationCategories } from "@/lib/apply/server";

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

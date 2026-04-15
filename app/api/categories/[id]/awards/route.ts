import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const awards = await prisma.award.findMany({
      where: { categoryId: id },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(awards);
  } catch (error) {
    console.error("GET /api/categories/[id]/awards error:", error);

    return NextResponse.json(
      { error: "Failed to fetch awards" },
      { status: 500 }
    );
  }
}

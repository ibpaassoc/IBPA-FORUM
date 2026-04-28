import type { NextRequest } from "next/server";
import { requireJuryAuth } from "@/features/jury/server/auth";
import { prisma } from "@/shared/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const juryUser = await requireJuryAuth();
  const { fileId } = await params;

  const fileRecord = await prisma.applicationFile.findUnique({
    where: {
      id: fileId,
    },
    include: {
      application: {
        select: {
          category: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (
    !fileRecord ||
    !juryUser.expertiseAreas.includes(fileRecord.application.category.name)
  ) {
    return new Response("Not found", { status: 404 });
  }

  return Response.redirect(fileRecord.fileUrl, 302);
}

import { readFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { fileId } = await params;

  const fileRecord = await prisma.juryApplicationFile.findUnique({
    where: { id: fileId },
    select: {
      fileName: true,
      mimeType: true,
      storageKey: true,
    },
  });

  if (!fileRecord?.storageKey) {
    return new Response("Not found", { status: 404 });
  }

  const uploadsRoot = path.resolve(process.cwd(), "data", "uploads");
  const absolutePath = path.resolve(process.cwd(), fileRecord.storageKey);

  // Only serve files from the dedicated uploads directory, even if a stored
  // path were ever tampered with in the database.
  if (!absolutePath.startsWith(uploadsRoot)) {
    return new Response("Invalid file path", { status: 400 });
  }

  try {
    const fileBuffer = await readFile(absolutePath);

    return new Response(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": fileRecord.mimeType || "application/octet-stream",
        "Content-Disposition": `inline; filename="${fileRecord.fileName}"`,
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

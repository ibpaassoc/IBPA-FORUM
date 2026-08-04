import { prisma } from "@/shared/lib/prisma";
import { getTestSession, isTestSystemAvailable } from "@/features/test/server/auth";

export async function GET() {
  if (!isTestSystemAvailable()) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  if (!(await getTestSession())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const categories = await prisma.category.findMany();

  return Response.json(categories);
}

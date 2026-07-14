import { NextResponse } from "next/server";
import { processApplicantDeadlineClosure } from "@/features/applications/server/closure";
import { isAdminAuthenticated } from "@/shared/lib/admin-auth";

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const result = await processApplicantDeadlineClosure();
  return NextResponse.json({ ok: true, ...result });
}

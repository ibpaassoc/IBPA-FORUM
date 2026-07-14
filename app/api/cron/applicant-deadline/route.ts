import { NextResponse } from "next/server";
import { processApplicantDeadlineClosure } from "@/features/applications/server/closure";
import {
  getApplicantApplicationsClosedAt,
  getApplicantSubmissionDeadline,
} from "@/features/applications/server/deadlines";

export async function POST(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ ok: false, message: "Unauthorized." }, { status: 401 });
    }
  }

  const [deadline, closedAt] = await Promise.all([
    getApplicantSubmissionDeadline(),
    getApplicantApplicationsClosedAt(),
  ]);

  if (closedAt) {
    return NextResponse.json({ ok: true, alreadyClosed: true, closedAt });
  }

  if (deadline > new Date()) {
    return NextResponse.json({ ok: true, due: false, deadline });
  }

  const result = await processApplicantDeadlineClosure(deadline);
  return NextResponse.json({ ok: true, due: true, ...result });
}

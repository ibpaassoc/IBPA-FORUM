import { NextResponse } from "next/server";

// Public jury applications are permanently closed. This endpoint used to accept
// new jury submissions (submitJuryApplication). It now rejects every request at
// the server level — including direct API calls, old browser tabs, cached JS,
// bookmarked pages, and automated requests — so no new jury application can be
// created. 410 Gone signals the resource existed but is intentionally retired.
//
// This does NOT affect existing jury records or the other /api/jury/* routes
// (uploads, additional-info, file serving, scoring), which serve existing jury
// members and admin review.
export function POST() {
  return NextResponse.json(
    { message: "Jury applications are closed. New applications are no longer accepted." },
    { status: 410 }
  );
}

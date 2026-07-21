import { NextResponse } from "next/server";
import { submitJuryApplication } from "@/features/jury/server/commands";
import { isValidJuryApplyAccessToken } from "@/lib/jury/apply-access";

export async function POST(request: Request) {
  const formData = await request.formData();

  if (!isValidJuryApplyAccessToken(String(formData.get("accessToken") ?? ""))) {
    return NextResponse.json(
      { message: "This jury application link is invalid or no longer available." },
      { status: 403 }
    );
  }

  const result = await submitJuryApplication(formData);

  return NextResponse.json(result.body, { status: result.status });
}

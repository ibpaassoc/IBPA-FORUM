import { NextResponse } from "next/server";
import { processJuryAdditionalInfoResubmission } from "@/features/jury/server/commands";
import type { BlobFileInfo } from "@/features/jury/server/uploads";

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!token) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }

  let body: {
    professionalBio: string;
    motivation: string;
    conflictDisclosure: string;
    professionalWebsite?: string;
    profilePhotoBlob?: BlobFileInfo | null;
    certificationBlobs?: BlobFileInfo[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { professionalBio, motivation, conflictDisclosure, professionalWebsite, profilePhotoBlob, certificationBlobs } = body;

  if (!professionalBio?.trim()) {
    return NextResponse.json({ error: "Professional bio is required." }, { status: 400 });
  }

  if (!motivation?.trim()) {
    return NextResponse.json({ error: "Motivation is required." }, { status: 400 });
  }

  if (!conflictDisclosure?.trim()) {
    return NextResponse.json({ error: "Conflict disclosure is required." }, { status: 400 });
  }

  if (!professionalWebsite?.trim()) {
    return NextResponse.json({ error: "Instagram is required." }, { status: 400 });
  }

  if (!isValidUrl(professionalWebsite.trim())) {
    return NextResponse.json({ error: "Please enter a valid Instagram URL." }, { status: 400 });
  }

  try {
    const result = await processJuryAdditionalInfoResubmission({
      token,
      professionalBio: professionalBio.trim(),
      motivation: motivation.trim(),
      conflictDisclosure: conflictDisclosure.trim(),
      professionalWebsite: professionalWebsite?.trim(),
      profilePhotoBlob: profilePhotoBlob ?? null,
      certificationBlobs: certificationBlobs ?? [],
    });

    return NextResponse.json({ ok: true, applicationId: result.applicationId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    const status = message.includes("Invalid or expired") || message.includes("already been used") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

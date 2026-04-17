import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";

function getText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function isFilledFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

function toOptionalText(value: string) {
  return value || null;
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function saveUploadedFile(
  file: File,
  applicationId: string,
  fieldKey: string,
  index = 0
) {
  const safeFileName = sanitizeFileName(file.name);
  const pathname = `jury/${applicationId}/${fieldKey}-${index + 1}-${safeFileName}`;

  const blob = await put(pathname, file, {
    access: "private",
    addRandomSuffix: true,
    contentType: file.type || "application/octet-stream",
  });

  return {
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    fileSize: file.size,
    storageKey: blob.pathname,
  };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const fullName = getText(formData, "fullName");
    const email = getText(formData, "email");
    const phone = getText(formData, "phone");
    const country = getText(formData, "country");
    const city = getText(formData, "city");
    const professionalTitle = getText(formData, "professionalTitle");
    const employerAffiliation = getText(formData, "employerAffiliation");
    const membershipStatus = getText(formData, "membershipStatus");
    const membershipLevel = getText(formData, "membershipLevel");
    const previousJudgingExperience = getText(
      formData,
      "previousJudgingExperience"
    );
    const previousJudgingDetails = getText(formData, "previousJudgingDetails");
    const pastWinner = getText(formData, "pastWinner");
    const pastWinnerYear = getText(formData, "pastWinnerYear");
    const professionalBio = getText(formData, "professionalBio");
    const professionalWebsite = getText(formData, "professionalWebsite");
    const conflictDisclosure = getText(formData, "conflictDisclosure");
    const motivation = getText(formData, "motivation");
    const confidentialityAgreement = getText(
      formData,
      "confidentialityAgreement"
    );

    const yearsExperience = Number(getText(formData, "yearsExperience"));
    const expertise = formData
      .getAll("expertise")
      .map((value) => String(value).trim())
      .filter(Boolean);

    const profilePhoto = formData.get("profilePhoto");
    const certifications = formData
      .getAll("certifications")
      .filter((value): value is File => isFilledFile(value));

    const fieldErrors: Record<string, string> = {};

    if (!fullName) fieldErrors.fullName = "Full legal name is required.";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      fieldErrors.email = "A valid email address is required.";
    }
    if (!phone) fieldErrors.phone = "Phone or WhatsApp is required.";
    if (!country) fieldErrors.country = "Country is required.";
    if (!city) fieldErrors.city = "City is required.";
    if (!professionalTitle) {
      fieldErrors.professionalTitle = "Professional title is required.";
    }
    if (!Number.isFinite(yearsExperience) || yearsExperience < 5) {
      fieldErrors.yearsExperience =
        "Jury candidates must have at least 5 years of experience.";
    }
    if (!employerAffiliation) {
      fieldErrors.employerAffiliation =
        "Current employer or affiliation is required.";
    }
    if (!membershipStatus) {
      fieldErrors.membershipStatus = "Membership status is required.";
    }
    if (!previousJudgingExperience) {
      fieldErrors.previousJudgingExperience =
        "Please tell us whether you have previous judging experience.";
    }
    if (
      previousJudgingExperience === "yes" &&
      !previousJudgingDetails
    ) {
      fieldErrors.previousJudgingDetails =
        "Please describe your previous judging experience.";
    }
    if (expertise.length === 0) {
      fieldErrors.expertise = "Select at least one area of expertise.";
    }
    if (certifications.length === 0) {
      fieldErrors.certifications =
        "Upload at least one professional certification.";
    }
    if (!professionalBio) {
      fieldErrors.professionalBio = "Professional bio is required.";
    }
    if (!isFilledFile(profilePhoto)) {
      fieldErrors.profilePhoto = "Profile photo is required.";
    }
    if (!conflictDisclosure) {
      fieldErrors.conflictDisclosure =
        "Conflict of interest disclosure is required.";
    }
    if (confidentialityAgreement !== "yes") {
      fieldErrors.confidentialityAgreement =
        "You must accept the confidentiality agreement.";
    }
    if (!motivation) {
      fieldErrors.motivation =
        "Please tell us why you want to serve as a judge.";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        {
          message:
            "Please complete all required jury application fields before submitting.",
          fieldErrors,
        },
        { status: 400 }
      );
    }

    if (!isFilledFile(profilePhoto)) {
      return NextResponse.json(
        { message: "Profile photo is required." },
        { status: 400 }
      );
    }

    const applicationId = randomUUID();

    const savedProfilePhoto = await saveUploadedFile(
      profilePhoto,
      applicationId,
      "profilePhoto"
    );

    const savedCertifications = await Promise.all(
      certifications.map((file, index) =>
        saveUploadedFile(file, applicationId, "certifications", index)
      )
    );

    const juryApplication = await prisma.juryApplication.create({
      data: {
        id: applicationId,
        fullName,
        email,
        phone,
        country,
        city,
        professionalTitle,
        yearsExperience,
        employerAffiliation,
        membershipStatus,
        membershipLevel: toOptionalText(membershipLevel),
        previousJudgingExperience: previousJudgingExperience === "yes",
        previousJudgingDetails: toOptionalText(previousJudgingDetails),
        pastWinner: pastWinner === "yes",
        pastWinnerYear: pastWinnerYear ? Number(pastWinnerYear) : null,
        expertiseAreas: expertise,
        professionalBio,
        professionalWebsite: toOptionalText(professionalWebsite),
        conflictDisclosure,
        confidentialityAgreementAccepted: true,
        motivation,
        status: "SUBMITTED",
        submittedAt: new Date(),
        files: {
          create: [
            {
              fieldKey: "profilePhoto",
              ...savedProfilePhoto,
            },
            ...savedCertifications.map((file) => ({
              fieldKey: "certifications",
              ...file,
            })),
          ],
        },
      },
      select: {
        id: true,
        fullName: true,
        city: true,
        country: true,
        expertiseAreas: true,
        status: true,
      },
    });

    return NextResponse.json(
      {
        message:
          "Your jury application has been received. IBPA review may take up to 14 business days.",
        id: juryApplication.id,
        status: juryApplication.status,
        summary: {
          name: juryApplication.fullName,
          location: `${juryApplication.city}, ${juryApplication.country}`,
          expertise: juryApplication.expertiseAreas,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to submit jury application", error);

    return NextResponse.json(
      {
        message:
          "We could not submit the jury application right now. Please try again.",
      },
      { status: 500 }
    );
  }
}

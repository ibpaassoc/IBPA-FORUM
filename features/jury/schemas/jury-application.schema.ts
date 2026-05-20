import { getText, isFilledFile } from "@/features/jury/server/uploads";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function buildJuryFieldErrors(formData: FormData) {
  const firstName = getText(formData, "firstName");
  const lastName = getText(formData, "lastName");
  const email = getText(formData, "email");
  const phone = getText(formData, "phone");
  const country = getText(formData, "country");
  const city = getText(formData, "city");
  const professionalTitle = getText(formData, "professionalTitle");
  const employerAffiliation = getText(formData, "employerAffiliation");
  const previousJudgingExperience = getText(formData, "previousJudgingExperience");
  const previousJudgingDetails = getText(formData, "previousJudgingDetails");
  const professionalBio = getText(formData, "professionalBio");
  const conflictDisclosure = getText(formData, "conflictDisclosure");
  const motivation = getText(formData, "motivation");
  const confidentialityAgreement = getText(formData, "confidentialityAgreement");
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

  if (!firstName) fieldErrors.firstName = "First name is required.";
  if (!lastName) fieldErrors.lastName = "Last name is required.";
  if (!email || !isValidEmail(email)) {
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
  if (!previousJudgingExperience) {
    fieldErrors.previousJudgingExperience =
      "Please tell us whether you have previous judging experience.";
  }
  if (previousJudgingExperience === "yes" && !previousJudgingDetails) {
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

  return fieldErrors;
}

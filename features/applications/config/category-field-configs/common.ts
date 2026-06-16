import type { ApplyFieldConfig } from "@/features/applications/types/application.types";

export const imageAndPdf = ["image/jpeg", "image/png", "application/pdf"];
export const imageOnly = ["image/jpeg", "image/png"];
export const pdfOnly = ["application/pdf"];

export function pressFields(prefix = "press") {
  return [
    {
      key: `${prefix}Url`,
      label: "Published Features / Press URL",
      type: "url",
      description: "Optional link to features, interviews, or media coverage.",
    },
    {
      key: `${prefix}Files`,
      label: "Published Features / Press Files",
      type: "file",
      description: "Optional supporting screenshots, PDFs, or press materials.",
      accept: imageAndPdf,
      maxFiles: 3,
      maxFileSizeMb: 5,
    },
  ] satisfies ApplyFieldConfig[];
}

export function optionalCertificates(
  label = "Professional Certifications",
  maxFiles = 10
) {
  return [
    {
      key: "professionalCertifications",
      label,
      type: "file",
      description: `Optional supporting certificates, up to ${maxFiles} files.`,
      accept: imageAndPdf,
      maxFiles,
    },
  ] satisfies ApplyFieldConfig[];
}

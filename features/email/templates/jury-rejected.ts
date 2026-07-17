import { buildTextBody, wrapEmail } from "@/features/email/templates/layout";

export function juryRejected({ fullName }: { fullName: string }) {
  const paragraphs = [
    `Dear ${fullName},`,
    "Thank you for your interest in joining the IBPA Beauty Award jury panel and for the time you invested in your application.",
    "After careful consideration, we are unable to offer you a place on the jury panel at this time. We sincerely appreciate your interest in supporting the IBPA community.",
  ];

  return {
    subject: "IBPA Jury Application Update",
    html: wrapEmail("Thank you for your jury application", paragraphs),
    text: buildTextBody(paragraphs),
  };
}

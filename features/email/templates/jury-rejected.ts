import { buildTextBody, wrapEmail } from "@/features/email/templates/layout";

export function juryRejected({ fullName }: { fullName: string }) {
  const paragraphs = [
    `Dear ${fullName},`,
    "Thank you for your interest in serving on the IBPA Beauty Championship jury panel.",
    "After careful review, we are not able to move forward with your application at this time. We appreciate the time and professionalism you invested in your submission.",
  ];

  return {
    subject: "IBPA Jury Application Update",
    html: wrapEmail("Thank you for your jury application", paragraphs),
    text: buildTextBody(paragraphs),
  };
}

import { buildTextBody, wrapEmail } from "@/features/email/templates/layout";

export function juryApplicationReceived({ fullName }: { fullName: string }) {
  const paragraphs = [
    `Dear ${fullName},`,
    "Thank you for applying to join the IBPA Beauty Award jury panel.",
    "We have received your application, and the IBPA team will review it shortly. We will email you once a decision has been made or if we need any additional information.",
  ];

  return {
    subject: "IBPA Jury Application Received",
    html: wrapEmail("We have received your jury application", paragraphs),
    text: buildTextBody(paragraphs),
  };
}

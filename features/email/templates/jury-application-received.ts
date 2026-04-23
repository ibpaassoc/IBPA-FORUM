import { buildTextBody, wrapEmail } from "@/features/email/templates/layout";

export function juryApplicationReceived({ fullName }: { fullName: string }) {
  const paragraphs = [
    `Dear ${fullName},`,
    "Thank you for applying to serve on the IBPA Beauty Championship jury panel.",
    "Your application has been received successfully and is now pending review by the IBPA team.",
  ];

  return {
    subject: "IBPA Jury Application Received",
    html: wrapEmail("Your jury application has been received", paragraphs),
    text: buildTextBody(paragraphs),
  };
}

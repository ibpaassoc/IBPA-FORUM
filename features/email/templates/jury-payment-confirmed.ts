import { buildTextBody, wrapEmail } from "@/features/email/templates/layout";

export function juryPaymentConfirmed({ fullName }: { fullName: string }) {
  const paragraphs = [
    `Dear ${fullName},`,
    "Your $250 USD jury registration fee has been received successfully.",
    "Your jury application is now fully confirmed, and the IBPA team will follow up with official next-step details separately.",
  ];

  return {
    subject: "Your IBPA Jury Registration Is Confirmed",
    html: wrapEmail("Your jury payment has been confirmed", paragraphs),
    text: buildTextBody(paragraphs),
  };
}

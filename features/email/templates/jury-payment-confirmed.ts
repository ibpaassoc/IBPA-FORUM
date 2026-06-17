import { buildTextBody, wrapEmail } from "@/features/email/templates/layout";

function formatAmount(amountCents: number, currency: string): string {
  const dollars = amountCents / 100;
  const formatted = dollars % 1 === 0 ? String(dollars) : dollars.toFixed(2);
  return `$${formatted} ${currency.toUpperCase()}`;
}

export function juryPaymentConfirmed({
  fullName,
  amount,
  currency,
}: {
  fullName: string;
  amount: number;
  currency: string;
}) {
  const paragraphs = [
    `Dear ${fullName},`,
    `Your ${formatAmount(amount, currency)} jury registration fee has been received successfully.`,
    "Your jury application is now fully confirmed, and the IBPA team will follow up with official next-step details separately.",
  ];

  return {
    subject: "Your IBPA Jury Registration Is Confirmed",
    html: wrapEmail("Your jury payment has been confirmed", paragraphs),
    text: buildTextBody(paragraphs),
  };
}

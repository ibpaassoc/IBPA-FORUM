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
    `We have received your ${formatAmount(amount, currency)} jury registration fee.`,
    "Your place on the IBPA Beauty Award jury panel is now confirmed. The IBPA team will contact you soon with the next steps.",
  ];

  return {
    subject: "Your IBPA Jury Registration Is Confirmed",
    html: wrapEmail("Your jury registration is confirmed", paragraphs),
    text: buildTextBody(paragraphs),
  };
}

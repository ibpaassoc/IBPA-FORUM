import { buildTextBody, wrapEmail } from "@/features/email/templates/layout";

export function juryApprovedPaymentLink({
  fullName,
  checkoutUrl,
}: {
  fullName: string;
  checkoutUrl: string;
}) {
  const paragraphs = [
    `Dear ${fullName},`,
    "We are pleased to let you know that your jury application has been approved.",
    `To finalize your jury registration, please complete the official $250 USD payment using this secure Stripe Checkout link: <a href="${checkoutUrl}" style="color:#f3d881;">${checkoutUrl}</a>.`,
    "Your public jury profile will be activated after Stripe confirms payment.",
  ];

  return {
    subject: "Your IBPA Jury Application Has Been Approved",
    html: wrapEmail("Complete your jury registration payment", paragraphs),
    text: buildTextBody([
      `Dear ${fullName},`,
      "We are pleased to let you know that your jury application has been approved.",
      `To finalize your jury registration, please complete the official $250 USD payment using this secure Stripe Checkout link: ${checkoutUrl}.`,
      "Your public jury profile will be activated after Stripe confirms payment.",
    ]),
  };
}

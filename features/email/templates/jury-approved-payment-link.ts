import { buildTextBody, ctaButton, wrapEmail } from "@/features/email/templates/layout";

export function juryApprovedPaymentLink({
  fullName,
  checkoutUrl,
}: {
  fullName: string;
  checkoutUrl: string;
}) {
  return {
    subject: "Your IBPA Jury Application Has Been Approved",
    html: wrapEmail("Complete your jury registration", [
      `Dear ${fullName},`,
      "We are pleased to let you know that your jury application has been approved.",
      "To finalize your jury registration, please complete the payment using the secure Stripe Checkout link below.",
      ctaButton("Complete Registration", checkoutUrl),
      "Your public jury profile will be activated after Stripe confirms your payment.",
    ]),
    text: buildTextBody([
      `Dear ${fullName},`,
      "We are pleased to let you know that your jury application has been approved.",
      "To finalize your jury registration, please complete the payment using the secure link below.",
      checkoutUrl,
      "Your public jury profile will be activated after Stripe confirms your payment.",
    ]),
  };
}

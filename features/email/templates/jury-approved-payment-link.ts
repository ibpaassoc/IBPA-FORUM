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
      "We are pleased to let you know that your application to join the IBPA Beauty Award jury panel has been approved.",
      "To finalize your registration, please pay the jury registration fee using the secure link below.",
      ctaButton("Complete Registration", checkoutUrl),
      "Once your payment is confirmed, we will activate your public jury profile and send you the next steps.",
    ]),
    text: buildTextBody([
      `Dear ${fullName},`,
      "We are pleased to let you know that your application to join the IBPA Beauty Award jury panel has been approved.",
      "To finalize your registration, please pay the jury registration fee using the secure link below.",
      checkoutUrl,
      "Once your payment is confirmed, we will activate your public jury profile and send you the next steps.",
    ]),
  };
}

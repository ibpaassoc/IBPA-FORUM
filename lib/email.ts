export { sendEmail } from "@/features/email/server/send-email";
export {
  EMAIL_NO_REPLY,
  EMAIL_PAYMENTS,
  EMAIL_SUPPORT,
  EMAIL_APPLICATIONS,
  EMAIL_TEST,
  EMAIL_REDIRECT_ALL_TO_TEST,
  resolveFrom,
  resolveTo,
} from "@/lib/email/config";
export { sendApplicationReceivedNotificationEmail } from "@/features/email/server/application-email.workflow";
export { sendCompetitorApplicationConfirmedEmail } from "@/features/email/server/competitor-email.workflow";
export {
  sendJuryApplicationReceivedEmail,
  sendJuryApprovedPaymentLinkEmail,
  sendJuryRejectedEmail,
  sendJuryPaymentConfirmedEmail,
} from "@/features/email/server/jury-email.workflow";
export { competitorApplicationConfirmed } from "@/features/email/templates/competitor-application-confirmed";
export { juryApplicationReceived } from "@/features/email/templates/jury-application-received";
export { juryApprovedPaymentLink } from "@/features/email/templates/jury-approved-payment-link";
export { juryRejected } from "@/features/email/templates/jury-rejected";
export { juryPaymentConfirmed } from "@/features/email/templates/jury-payment-confirmed";

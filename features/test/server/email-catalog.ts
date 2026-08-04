import "server-only";

import { accountSetupTemplate, passwordResetTemplate, sendAccountPasswordResetEmail, sendAccountSetupEmail } from "@/features/account/server/emails";
import { sendEmail, type SendEmailResult } from "@/features/email/server/send-email";
import { applicationReceivedNotificationTemplate, sendApplicationReceivedNotificationEmail } from "@/features/email/server/application-email.workflow";
import { competitorApplicationConfirmed } from "@/features/email/templates/competitor-application-confirmed";
import { sendCompetitorApplicationConfirmedEmail } from "@/features/email/server/competitor-email.workflow";
import { juryAdditionalInfoRequested } from "@/features/email/templates/jury-additional-info-requested";
import { juryApplicationReceived } from "@/features/email/templates/jury-application-received";
import { juryApprovedPaymentLink } from "@/features/email/templates/jury-approved-payment-link";
import { juryPasswordReset } from "@/features/email/templates/jury-password-reset";
import { juryPaymentConfirmed } from "@/features/email/templates/jury-payment-confirmed";
import { juryRejected } from "@/features/email/templates/jury-rejected";
import {
  sendJuryAdditionalInfoRequestedEmail,
  sendJuryApplicationReceivedEmail,
  sendJuryApprovedPaymentLinkEmail,
  sendJuryPaymentConfirmedEmail,
  sendJuryRejectedEmail,
} from "@/features/email/server/jury-email.workflow";
import { paymentAdminNotificationTemplate, sendPaymentAdminNotificationEmail } from "@/features/email/server/payment-email.workflow";
import { ticketConfirmationTemplate } from "@/features/tickets/templates/ticket-confirmation";
import { ticketPaymentLinkTemplate } from "@/features/tickets/templates/ticket-payment-link";
import { sendTicketConfirmationEmail, sendTicketPaymentLinkEmail } from "@/features/tickets/server/ticket-email.workflow";
import { runWithDataScope } from "@/features/test/server/data-scope";

type Template = { subject: string; html: string; text: string };
type Inputs = Record<string, unknown>;

export type EmailCatalogEntry = {
  id: string;
  name: string;
  category: "applicant" | "jury" | "tickets" | "authentication" | "payment" | "other";
  description: string;
  requiredInputs: Array<{ name: string; type: string; description: string }>;
  defaultInputs: Inputs;
  preview: (inputs: Inputs) => Template;
  send: (inputs: Inputs) => Promise<SendEmailResult>;
};

const text = (inputs: Inputs, key: string) => String(inputs[key] ?? "");
const number = (inputs: Inputs, key: string) => Number(inputs[key] ?? 0);
const bool = (inputs: Inputs, key: string) => Boolean(inputs[key]);
const input = (name: string, type: string, description: string) => ({ name, type, description });

export const EMAIL_TEST_CATALOG: EmailCatalogEntry[] = [
  {
    id: "account-setup",
    name: "Account setup",
    category: "authentication",
    description: "Applicant or jury first-time password setup.",
    requiredInputs: [input("to", "email", "Original intended recipient"), input("fullName", "string", "Account holder name"), input("token", "string", "One-time setup token")],
    defaultInputs: { to: "new-account@example.invalid", fullName: "Test Account", token: "test-setup-token" },
    preview: (v) => accountSetupTemplate({ fullName: text(v, "fullName"), setupUrl: `https://example.com/account/setup?token=${encodeURIComponent(text(v, "token"))}` }),
    send: (v) => sendAccountSetupEmail({ to: text(v, "to"), fullName: text(v, "fullName"), token: text(v, "token") }),
  },
  {
    id: "account-password-reset",
    name: "Account password reset",
    category: "authentication",
    description: "Unified account password reset message.",
    requiredInputs: [input("to", "email", "Original intended recipient"), input("token", "string", "One-time reset token")],
    defaultInputs: { to: "account@example.invalid", token: "test-reset-token" },
    preview: (v) => passwordResetTemplate({ resetUrl: `https://example.com/account/reset-password?token=${encodeURIComponent(text(v, "token"))}` }),
    send: (v) => sendAccountPasswordResetEmail({ to: text(v, "to"), token: text(v, "token") }),
  },
  {
    id: "jury-legacy-password-reset",
    name: "Legacy jury password reset",
    category: "authentication",
    description: "Existing jury-specific reset template retained by the project.",
    requiredInputs: [input("to", "email", "Original intended recipient"), input("resetUrl", "url", "Password reset URL")],
    defaultInputs: { to: "jury@example.invalid", resetUrl: "https://example.com/jury/reset-password?token=test" },
    preview: (v) => juryPasswordReset({ resetUrl: text(v, "resetUrl") }),
    send: async (v) => {
      const template = juryPasswordReset({ resetUrl: text(v, "resetUrl") });
      return sendEmail({ type: "user", to: text(v, "to"), ...template });
    },
  },
  {
    id: "competitor-confirmed",
    name: "Applicant payment confirmed",
    category: "applicant",
    description: "Paid competitor application confirmation.",
    requiredInputs: [input("to", "email", "Original intended recipient"), input("fullName", "string", "Applicant name"), input("categoryName", "string", "Category"), input("awardName", "string", "Nomination"), input("amount", "integer", "Paid amount in cents"), input("currency", "string", "ISO currency")],
    defaultInputs: { to: "applicant@example.invalid", fullName: "Test Applicant", categoryName: "Hair", awardName: "Hair Artist", amount: 10000, currency: "usd" },
    preview: (v) => competitorApplicationConfirmed({ fullName: text(v, "fullName"), categoryName: text(v, "categoryName"), awardName: text(v, "awardName"), amount: number(v, "amount"), currency: text(v, "currency") }),
    send: (v) => sendCompetitorApplicationConfirmedEmail({ to: text(v, "to"), fullName: text(v, "fullName"), categoryName: text(v, "categoryName"), awardName: text(v, "awardName"), amount: number(v, "amount"), currency: text(v, "currency") }),
  },
  {
    id: "jury-application-received",
    name: "Jury application received",
    category: "jury",
    description: "Acknowledges a new jury application.",
    requiredInputs: [input("to", "email", "Original intended recipient"), input("fullName", "string", "Applicant name")],
    defaultInputs: { to: "jury@example.invalid", fullName: "Test Jury" },
    preview: (v) => juryApplicationReceived({ fullName: text(v, "fullName") }),
    send: (v) => sendJuryApplicationReceivedEmail({ to: text(v, "to"), fullName: text(v, "fullName") }),
  },
  {
    id: "jury-approved-payment-link",
    name: "Jury approval payment link",
    category: "jury",
    description: "Approval notice and Stripe checkout link.",
    requiredInputs: [input("to", "email", "Original intended recipient"), input("fullName", "string", "Jury applicant name"), input("checkoutUrl", "url", "Checkout URL")],
    defaultInputs: { to: "jury@example.invalid", fullName: "Test Jury", checkoutUrl: "https://checkout.stripe.com/test" },
    preview: (v) => juryApprovedPaymentLink({ fullName: text(v, "fullName"), checkoutUrl: text(v, "checkoutUrl") }),
    send: (v) => sendJuryApprovedPaymentLinkEmail({ to: text(v, "to"), fullName: text(v, "fullName"), checkoutUrl: text(v, "checkoutUrl") }),
  },
  {
    id: "jury-rejected",
    name: "Jury application rejected",
    category: "jury",
    description: "Jury application decision notice.",
    requiredInputs: [input("to", "email", "Original intended recipient"), input("fullName", "string", "Jury applicant name")],
    defaultInputs: { to: "jury@example.invalid", fullName: "Test Jury" },
    preview: (v) => juryRejected({ fullName: text(v, "fullName") }),
    send: (v) => sendJuryRejectedEmail({ to: text(v, "to"), fullName: text(v, "fullName") }),
  },
  {
    id: "jury-payment-confirmed",
    name: "Jury payment confirmed",
    category: "jury",
    description: "Confirms paid jury registration.",
    requiredInputs: [input("to", "email", "Original intended recipient"), input("fullName", "string", "Jury member name"), input("amount", "integer", "Paid amount in cents"), input("currency", "string", "ISO currency")],
    defaultInputs: { to: "jury@example.invalid", fullName: "Test Jury", amount: 25000, currency: "usd" },
    preview: (v) => juryPaymentConfirmed({ fullName: text(v, "fullName"), amount: number(v, "amount"), currency: text(v, "currency") }),
    send: (v) => sendJuryPaymentConfirmedEmail({ to: text(v, "to"), fullName: text(v, "fullName"), amount: number(v, "amount"), currency: text(v, "currency") }),
  },
  {
    id: "jury-additional-info",
    name: "Jury additional information",
    category: "jury",
    description: "Requests updates to a jury application.",
    requiredInputs: [input("to", "email", "Original intended recipient"), input("fullName", "string", "Jury applicant name"), input("details", "string", "Requested information"), input("actionUrl", "url", "Secure update URL")],
    defaultInputs: { to: "jury@example.invalid", fullName: "Test Jury", details: "Please provide an updated certification.", actionUrl: "https://example.com/jury-update/test-token" },
    preview: (v) => juryAdditionalInfoRequested({ fullName: text(v, "fullName"), details: text(v, "details"), actionUrl: text(v, "actionUrl") }),
    send: (v) => sendJuryAdditionalInfoRequestedEmail({ to: text(v, "to"), fullName: text(v, "fullName"), details: text(v, "details"), actionUrl: text(v, "actionUrl") }),
  },
  {
    id: "ticket-confirmation",
    name: "Ticket confirmation and QR",
    category: "tickets",
    description: "Paid ticket message with the real generated QR attachment.",
    requiredInputs: [input("to", "email", "Original intended recipient"), input("fullName", "string", "Ticket holder"), input("type", "ONE_DAY | TWO_DAYS", "Ticket type"), input("galaDinner", "boolean", "Gala extra"), input("secureToken", "string", "QR credential token"), input("instagram", "string|null", "Instagram handle")],
    defaultInputs: { to: "ticket@example.invalid", fullName: "Test Ticket Holder", type: "TWO_DAYS", galaDinner: true, secureToken: "test-secure-ticket-token", instagram: "@ibpatest" },
    preview: (v) => ticketConfirmationTemplate({ fullName: text(v, "fullName"), type: text(v, "type") === "ONE_DAY" ? "ONE_DAY" : "TWO_DAYS", galaDinner: bool(v, "galaDinner"), paymentUrl: `https://example.com/tickets/${text(v, "secureToken")}`, instagram: text(v, "instagram"), accessUpdated: false }),
    send: (v) => sendTicketConfirmationEmail({ to: text(v, "to"), fullName: text(v, "fullName"), type: text(v, "type") === "ONE_DAY" ? "ONE_DAY" : "TWO_DAYS", galaDinner: bool(v, "galaDinner"), secureToken: text(v, "secureToken"), instagram: text(v, "instagram") }),
  },
  {
    id: "ticket-payment-link",
    name: "Ticket payment link",
    category: "tickets",
    description: "Fresh unpaid ticket checkout link.",
    requiredInputs: [input("to", "email", "Original intended recipient"), input("fullName", "string", "Ticket holder"), input("type", "ONE_DAY | TWO_DAYS", "Ticket type"), input("galaDinner", "boolean", "Gala extra"), input("amountCents", "integer", "Amount due in cents"), input("currency", "string", "ISO currency"), input("checkoutUrl", "url", "Checkout URL")],
    defaultInputs: { to: "ticket@example.invalid", fullName: "Test Ticket Holder", type: "ONE_DAY", galaDinner: false, amountCents: 25000, currency: "usd", checkoutUrl: "https://checkout.stripe.com/test" },
    preview: (v) => ticketPaymentLinkTemplate({ fullName: text(v, "fullName"), ticketSummary: `${text(v, "type")}${bool(v, "galaDinner") ? " + Gala Dinner" : ""}`, amountFormatted: new Intl.NumberFormat("en-US", { style: "currency", currency: text(v, "currency").toUpperCase() }).format(number(v, "amountCents") / 100), checkoutUrl: text(v, "checkoutUrl") }),
    send: (v) => sendTicketPaymentLinkEmail({ to: text(v, "to"), fullName: text(v, "fullName"), type: text(v, "type") === "TWO_DAYS" ? "TWO_DAYS" : "ONE_DAY", galaDinner: bool(v, "galaDinner"), amountCents: number(v, "amountCents"), currency: text(v, "currency"), checkoutUrl: text(v, "checkoutUrl") }),
  },
  {
    id: "admin-application-received",
    name: "Admin application received",
    category: "other",
    description: "Internal application notification currently sent by production flows.",
    requiredInputs: [input("applicationType", "string", "Application type"), input("applicantName", "string", "Applicant name"), input("applicantEmail", "email", "Applicant email"), input("details", "string[]", "Additional details")],
    defaultInputs: { applicationType: "Competitor", applicantName: "Test Applicant", applicantEmail: "applicant@example.invalid", details: ["Category: Hair"] },
    preview: (v) => applicationReceivedNotificationTemplate({ applicationType: text(v, "applicationType"), applicantName: text(v, "applicantName"), applicantEmail: text(v, "applicantEmail"), details: Array.isArray(v.details) ? v.details.map(String) : [] }),
    send: (v) => sendApplicationReceivedNotificationEmail({ applicationType: text(v, "applicationType"), applicantName: text(v, "applicantName"), applicantEmail: text(v, "applicantEmail"), details: Array.isArray(v.details) ? v.details.map(String) : [] }),
  },
  {
    id: "admin-payment-confirmed",
    name: "Admin payment confirmed",
    category: "payment",
    description: "Internal payment notification currently sent by production webhooks.",
    requiredInputs: [input("flowLabel", "string", "Payment flow"), input("applicantName", "string", "Customer name"), input("applicantEmail", "email", "Customer email"), input("amount", "integer", "Amount in cents"), input("currency", "string", "ISO currency"), input("stripeSessionId", "string", "Checkout session ID"), input("stripePaymentIntentId", "string|null", "Payment intent ID")],
    defaultInputs: { flowLabel: "Competitor nominations", applicantName: "Test Applicant", applicantEmail: "applicant@example.invalid", amount: 10000, currency: "usd", stripeSessionId: "cs_test_catalog", stripePaymentIntentId: "pi_test_catalog" },
    preview: (v) => paymentAdminNotificationTemplate({ flowLabel: text(v, "flowLabel"), applicantName: text(v, "applicantName"), applicantEmail: text(v, "applicantEmail"), amount: number(v, "amount"), currency: text(v, "currency"), stripeSessionId: text(v, "stripeSessionId"), stripePaymentIntentId: text(v, "stripePaymentIntentId") || null }),
    send: (v) => sendPaymentAdminNotificationEmail({ flowLabel: text(v, "flowLabel"), applicantName: text(v, "applicantName"), applicantEmail: text(v, "applicantEmail"), amount: number(v, "amount"), currency: text(v, "currency"), stripeSessionId: text(v, "stripeSessionId"), stripePaymentIntentId: text(v, "stripePaymentIntentId") || null }),
  },
];

export function getEmailCatalogEntry(id: string) {
  return EMAIL_TEST_CATALOG.find((entry) => entry.id === id) ?? null;
}
export async function sendCatalogEmail({
  templateId,
  recipient,
  inputs,
}: {
  templateId: string;
  recipient: string;
  inputs: Inputs;
}) {
  const entry = getEmailCatalogEntry(templateId);
  if (!entry) throw new Error("Unknown transactional email template.");
  if (!recipient.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(recipient)) {
    throw new Error("A valid test recipient is required.");
  }
  return runWithDataScope(
    {
      dataScope: "TEST",
      testEmailRecipient: recipient,
      testTemplateType: entry.id,
      testEmailCategory: entry.category,
    },
    () => entry.send(inputs),
  );
}

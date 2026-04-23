import "server-only";
import { Resend } from "resend";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

type SendEmailResult = {
  delivered: boolean;
  recipient?: string;
  reason?: "dev_email_missing" | "resend_missing";
};

type JuryEmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

type CompetitorConfirmationTemplateInput = {
  fullName: string;
  categoryName: string;
  awardName: string;
};

function isProduction() {
  return process.env.NODE_ENV === "production";
}

function wrapEmail(title: string, paragraphs: string[]) {
  const htmlParagraphs = paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("");

  return `
    <div style="background:#0f0f10;color:#f5efe2;padding:32px;font-family:Georgia,serif;">
      <div style="max-width:640px;margin:0 auto;border:1px solid rgba(216,194,122,0.25);border-radius:24px;padding:32px;background:rgba(255,255,255,0.04);">
        <p style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#d8c27a;margin:0 0 12px;">IBPA Beauty Championship</p>
        <h1 style="font-size:28px;line-height:1.2;margin:0 0 20px;">${title}</h1>
        <div style="font-size:15px;line-height:1.75;color:#e8dfcc;">${htmlParagraphs}</div>
      </div>
    </div>
  `;
}

function buildTextBody(lines: string[]) {
  return lines.join("\n\n");
}

function getNormalizedEmailPayload(input: SendEmailInput) {
  if (isProduction()) {
    const from = process.env.EMAIL_FROM;

    if (!from) {
      throw new Error("EMAIL_FROM is not configured.");
    }

    return {
      from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    };
  }

  const devEmail = process.env.DEV_EMAIL;
  const payload = {
    from: "IBPA <onboarding@resend.dev>",
    to: devEmail ?? "",
    subject: input.subject,
    html: input.html,
    text: input.text,
    originalTo: input.to,
  };

  console.log("DEV_EMAIL_PAYLOAD", payload);

  return payload;
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const payload = getNormalizedEmailPayload(input);

  if (!isProduction() && !payload.to) {
    console.warn("DEV_EMAIL is not configured. Skipping development email send.");
    return {
      delivered: false,
      reason: "dev_email_missing",
    };
  }

  if (!process.env.RESEND_API_KEY) {
    console.info("RESEND_API_KEY is not configured. Skipping email send.", {
      to: payload.to,
      subject: payload.subject,
    });
    return {
      delivered: false,
      recipient: payload.to,
      reason: "resend_missing",
    };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: payload.from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });

  return { delivered: true };
}

export function juryApplicationReceived({
  fullName,
}: {
  fullName: string;
}): JuryEmailTemplate {
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

export function juryApprovedPaymentLink({
  fullName,
  checkoutUrl,
}: {
  fullName: string;
  checkoutUrl: string;
}): JuryEmailTemplate {
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

export function juryRejected({
  fullName,
}: {
  fullName: string;
}): JuryEmailTemplate {
  const paragraphs = [
    `Dear ${fullName},`,
    "Thank you for your interest in serving on the IBPA Beauty Championship jury panel.",
    "After careful review, we are not able to move forward with your application at this time. We appreciate the time and professionalism you invested in your submission.",
  ];

  return {
    subject: "IBPA Jury Application Update",
    html: wrapEmail("Thank you for your jury application", paragraphs),
    text: buildTextBody(paragraphs),
  };
}

export function juryPaymentConfirmed({
  fullName,
}: {
  fullName: string;
}): JuryEmailTemplate {
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

export function competitorApplicationConfirmed({
  fullName,
  categoryName,
  awardName,
}: CompetitorConfirmationTemplateInput) {
  const paragraphs = [
    `Dear ${fullName},`,
    "Your $50 USD payment for the IBPA Beauty Championship competitor application has been received successfully.",
    `Your application for ${categoryName} / ${awardName} is now complete and has been submitted for review.`,
    "Our judges and admin team will review your materials and follow up with any next steps separately.",
  ];

  return {
    subject: "Your IBPA Competitor Application Is Complete",
    html: wrapEmail("Your competitor application has been confirmed", paragraphs),
    text: buildTextBody(paragraphs),
  };
}

export async function sendCompetitorApplicationConfirmedEmail({
  to,
  fullName,
  categoryName,
  awardName,
}: CompetitorConfirmationTemplateInput & {
  to: string;
}) {
  const template = competitorApplicationConfirmed({
    fullName,
    categoryName,
    awardName,
  });

  return sendEmail({
    to,
    subject: template.subject,
    html: template.html,
    text: template.text,
  });
}

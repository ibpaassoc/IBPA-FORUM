import "server-only";
import { Resend } from "resend";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export type SendEmailResult = {
  delivered: boolean;
  recipient?: string;
  reason?: "dev_email_missing" | "resend_missing";
};

function isProduction() {
  return process.env.NODE_ENV === "production";
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

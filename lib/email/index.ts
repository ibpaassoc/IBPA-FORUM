type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

type SendEmailResult = {
  delivered: boolean;
};

function getEmailFrom() {
  return process.env.EMAIL_FROM ?? "";
}

async function sendWithResend(payload: EmailPayload) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: getEmailFrom(),
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend request failed: ${response.status} ${body}`);
  }
}

async function sendEmail(payload: EmailPayload): Promise<SendEmailResult> {
  const emailFrom = getEmailFrom();

  if (!emailFrom) {
    console.info("EMAIL_FROM is not configured. Skipping email send.", {
      to: payload.to,
      subject: payload.subject,
    });
    return {
      delivered: false,
    };
  }

  if (process.env.RESEND_API_KEY) {
    await sendWithResend(payload);
    return {
      delivered: true,
    };
  }

  console.info("No transactional email provider is configured. Skipping email send.", {
    to: payload.to,
    subject: payload.subject,
  });

  return {
    delivered: false,
  };
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

export async function sendJuryApplicationReceivedEmail({
  to,
  fullName,
}: {
  to: string;
  fullName: string;
}) {
  return sendEmail({
    to,
    subject: "IBPA Jury Application Received",
    html: wrapEmail("Your jury application has been received", [
      `Dear ${fullName},`,
      "Thank you for applying to serve on the IBPA Beauty Championship jury panel.",
      "Your application has been received successfully and is now pending review by the IBPA team. Review may take up to 14 business days.",
    ]),
    text: buildTextBody([
      `Dear ${fullName},`,
      "Thank you for applying to serve on the IBPA Beauty Championship jury panel.",
      "Your application has been received successfully and is now pending review by the IBPA team. Review may take up to 14 business days.",
    ]),
  });
}

export async function sendJuryApprovalPaymentEmail({
  to,
  fullName,
  checkoutUrl,
}: {
  to: string;
  fullName: string;
  checkoutUrl: string;
}) {
  return sendEmail({
    to,
    subject: "Your IBPA Jury Application Has Been Approved",
    html: wrapEmail("Congratulations, your jury application was approved", [
      `Dear ${fullName},`,
      "We are pleased to let you know that your jury application has been approved.",
      `To finalize your jury activation, please complete the official $250 fee payment using this secure Stripe Checkout link: <a href="${checkoutUrl}" style="color:#f3d881;">${checkoutUrl}</a>.`,
      "Your jury access will be activated after successful payment confirmation.",
    ]),
    text: buildTextBody([
      `Dear ${fullName},`,
      "We are pleased to let you know that your jury application has been approved.",
      `To finalize your jury activation, please complete the official $250 fee payment using this secure Stripe Checkout link: ${checkoutUrl}.`,
      "Your jury access will be activated after successful payment confirmation.",
    ]),
  });
}

export async function sendJuryRejectionEmail({
  to,
  fullName,
}: {
  to: string;
  fullName: string;
}) {
  return sendEmail({
    to,
    subject: "IBPA Jury Application Update",
    html: wrapEmail("Thank you for your jury application", [
      `Dear ${fullName},`,
      "Thank you for your interest in serving on the IBPA Beauty Championship jury panel.",
      "After careful review, we are not able to move forward with your application at this time. We appreciate the time and professionalism you invested in your submission.",
    ]),
    text: buildTextBody([
      `Dear ${fullName},`,
      "Thank you for your interest in serving on the IBPA Beauty Championship jury panel.",
      "After careful review, we are not able to move forward with your application at this time. We appreciate the time and professionalism you invested in your submission.",
    ]),
  });
}

export async function sendJuryPaymentConfirmedEmail({
  to,
  fullName,
  registrationUrl,
}: {
  to: string;
  fullName: string;
  registrationUrl: string;
}) {
  return sendEmail({
    to,
    subject: "Your Jury Registration Link Is Ready",
    html: wrapEmail("Your payment has been confirmed", [
      `Dear ${fullName},`,
      "Your jury fee has been received successfully and your status is now active.",
      `Please continue with your jury onboarding using this secure registration link: <a href="${registrationUrl}" style="color:#f3d881;">${registrationUrl}</a>.`,
      "This link is unique to your application and will be used for the next step of jury onboarding.",
    ]),
    text: buildTextBody([
      `Dear ${fullName},`,
      "Your jury fee has been received successfully and your status is now active.",
      `Please continue with your jury onboarding using this secure registration link: ${registrationUrl}.`,
      "This link is unique to your application and will be used for the next step of jury onboarding.",
    ]),
  });
}

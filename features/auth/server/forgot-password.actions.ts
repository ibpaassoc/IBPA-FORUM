"use server";

import { randomBytes } from "node:crypto";
import { prisma } from "@/shared/lib/prisma";
import { findJuryAccountByEmail, normalizeJuryEmail } from "@/features/jury/server/auth";
import { sendEmail } from "@/features/email/server/send-email";
import { juryPasswordReset } from "@/features/email/templates/jury-password-reset";

export type ForgotPasswordState = {
  sent?: boolean;
  error?: string;
};

export async function forgotPasswordAction(
  _prev: ForgotPasswordState | undefined,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = normalizeJuryEmail(String(formData.get("email") ?? ""));

  if (!email) {
    return { error: "Email is required." };
  }

  const account = await findJuryAccountByEmail(email);

  // Always return success to prevent email enumeration attacks
  if (!account) {
    return { sent: true };
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.juryPasswordReset.deleteMany({ where: { email } });

  await prisma.juryPasswordReset.create({
    data: { email, token, expiresAt },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "";
  const resetUrl = `${baseUrl}/jury/reset-password?token=${token}`;

  const emailPayload = juryPasswordReset({ resetUrl });

  await sendEmail({
    type: "user",
    to: email,
    subject: emailPayload.subject,
    html: emailPayload.html,
    text: emailPayload.text,
  });

  return { sent: true };
}

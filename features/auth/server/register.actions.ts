"use server";

import { prisma } from "@/shared/lib/prisma";
import {
  createPasswordHash,
  findJuryAccountByEmail,
  isStrongPassword,
  normalizeJuryEmail,
} from "@/features/jury/server/auth";

export type RegisterState = {
  error?: string;
  success?: boolean;
  email?: string;
};

export async function registerAccountAction(
  _previousState: RegisterState | undefined,
  formData: FormData
): Promise<RegisterState> {
  const email = normalizeJuryEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!email) {
    return {
      error: "Email is required.",
    };
  }

  if (!isStrongPassword(password)) {
    return {
      email,
      error: "Password must be at least 8 characters long.",
    };
  }

  if (password !== confirmPassword) {
    return {
      email,
      error: "Passwords do not match.",
    };
  }

  const existingAccount = await findJuryAccountByEmail(email);

  if (existingAccount) {
    return {
      email,
      error: "An account with this email already exists.",
    };
  }

  const passwordHash = await createPasswordHash(password);

  await prisma.juryAccount.create({
    data: {
      email,
      passwordHash,
    },
  });

  return {
    success: true,
    email,
  };
}

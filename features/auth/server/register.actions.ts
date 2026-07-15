"use server";

import { prisma } from "@/shared/lib/prisma";
import { upsertJuryAccountForApplication } from "@/features/account/server/accounts";
import {
  createPasswordHash,
  getJuryApplicationByEmail,
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

  const juryApplication = await getJuryApplicationByEmail(email);

  if (!juryApplication) {
    return {
      email,
      error: "There is no jury application with this email.",
    };
  }

  if (juryApplication.paymentStatus !== "PAID") {
    return {
      email,
      error: "Payment is incomplete for this email.",
    };
  }

  const passwordHash = await createPasswordHash(password);

  const existingAccount = await prisma.account.findUnique({ where: { email } });

  if (existingAccount?.role && existingAccount.role !== "JURY") {
    return {
      email,
      error: "An account with this email already exists for another role. Please contact IBPA support.",
    };
  }

  if (existingAccount?.passwordHash && existingAccount.status === "ACTIVE") {
    return {
      email,
      error: "An account with this email already exists.",
    };
  }

  await prisma.$transaction(async (tx) => {
    const fullApplication = await tx.juryApplication.findUniqueOrThrow({
      where: { id: juryApplication.id },
    });

    const { account } = await upsertJuryAccountForApplication(tx, fullApplication);

    await tx.account.update({
      where: { id: account.id },
      data: {
        passwordHash,
        status: "ACTIVE",
      },
    });
  });

  return {
    success: true,
    email,
  };
}

"use server";

import { prisma } from "@/shared/lib/prisma";
import {
  createPasswordHash,
  findJuryAccountByEmail,
  getPaidJuryApplicationByEmail,
  isStrongPassword,
  normalizeJuryEmail,
} from "@/features/jury/server/auth";
import type { JuryRegistrationState } from "@/features/jury/server/register.types";

export async function checkJuryRegistrationEmailAction(
  _previousState: JuryRegistrationState,
  formData: FormData
): Promise<JuryRegistrationState> {
  const email = normalizeJuryEmail(String(formData.get("email") ?? ""));

  if (!email) {
    return {
      step: "email",
      error: "Enter the email address used for your jury application.",
    };
  }

  const juryApplication = await getPaidJuryApplicationByEmail(email);

  if (!juryApplication) {
    return {
      step: "email",
      error: "There is no jury application with this email.",
    };
  }

  if (juryApplication.paymentStatus !== "PAID") {
    return {
      step: "email",
      error: "There is no payment completed with this email.",
    };
  }

  const account = await findJuryAccountByEmail(email);

  if (account) {
    return {
      step: "email",
      email,
      notice:
        "This email is already registered for jury access. Please log in to continue.",
    };
  }

  return {
    step: "password",
    email,
    notice: "Payment verified. Create your jury password to continue.",
  };
}

export async function createJuryAccountAction(
  _previousState: JuryRegistrationState,
  formData: FormData
): Promise<JuryRegistrationState> {
  const email = normalizeJuryEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!email) {
    return {
      step: "email",
      error: "Enter the email address used for your jury application.",
    };
  }

  if (!isStrongPassword(password)) {
    return {
      step: "password",
      email,
      error: "Password must be at least 8 characters long.",
    };
  }

  if (password !== confirmPassword) {
    return {
      step: "password",
      email,
      error: "Passwords do not match.",
    };
  }

  const juryApplication = await getPaidJuryApplicationByEmail(email);

  if (!juryApplication) {
    return {
      step: "email",
      error: "There is no jury application with this email.",
    };
  }

  if (juryApplication.paymentStatus !== "PAID") {
    return {
      step: "email",
      error: "There is no payment completed with this email.",
    };
  }

  const existingAccount = await findJuryAccountByEmail(email);

  if (existingAccount) {
    return {
      step: "email",
      email,
      notice:
        "This email is already registered for jury access. Please log in to continue.",
    };
  }

  const passwordHash = await createPasswordHash(password);

  await prisma.juryAccount.create({
    data: {
      email,
      passwordHash,
      juryApplicationId: juryApplication.id,
    },
  });

  return {
    step: "password",
    email,
    success: true,
    notice: "Your jury account is ready. Signing you in now.",
  };
}

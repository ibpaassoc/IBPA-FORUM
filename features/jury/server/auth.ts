import "server-only";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { redirect } from "next/navigation";
import { getAppSession } from "@/auth";
import { prisma } from "@/shared/lib/prisma";

const scrypt = promisify(scryptCallback);
const HASH_KEY_LENGTH = 64;

export type JuryAuthUser = {
  id: string;
  email: string;
  juryApplicationId: string;
  expertiseAreas: string[];
};

export function normalizeJuryEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isStrongPassword(password: string) {
  return password.length >= 8;
}

export async function createPasswordHash(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, HASH_KEY_LENGTH)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPasswordHash(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(":");

  if (!salt || !hash) {
    return false;
  }

  const storedBuffer = Buffer.from(hash, "hex");
  const derived = (await scrypt(password, salt, HASH_KEY_LENGTH)) as Buffer;

  if (storedBuffer.length !== derived.length) {
    return false;
  }

  return timingSafeEqual(storedBuffer, derived);
}

export async function findJuryAccountByEmail(email: string) {
  return prisma.juryAccount.findUnique({
    where: {
      email: normalizeJuryEmail(email),
    },
    include: {
      juryApplication: {
        select: {
          id: true,
          expertiseAreas: true,
          status: true,
          paymentStatus: true,
        },
      },
    },
  });
}

export async function getPaidJuryApplicationByEmail(email: string) {
  return prisma.juryApplication.findUnique({
    where: {
      email: normalizeJuryEmail(email),
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      paymentStatus: true,
      status: true,
      expertiseAreas: true,
    },
  });
}

export async function getJuryApplicationByEmail(email: string) {
  return prisma.juryApplication.findUnique({
    where: {
      email: normalizeJuryEmail(email),
    },
    select: {
      id: true,
      email: true,
      fullName: true,
      paymentStatus: true,
      status: true,
      expertiseAreas: true,
    },
  });
}

export async function validatePasswordResetToken(token: string): Promise<{
  valid: boolean;
  expired?: boolean;
}> {
  const record = await prisma.juryPasswordReset.findUnique({ where: { token } });

  if (!record || record.usedAt) {
    return { valid: false };
  }

  if (record.expiresAt < new Date()) {
    return { valid: false, expired: true };
  }

  return { valid: true };
}

export async function requireJuryAuth() {
  const session = await getAppSession();

  if (!session?.user?.email) {
    redirect("/jury/login");
  }

  const account = await prisma.juryAccount.findUnique({
    where: {
      email: normalizeJuryEmail(session.user.email),
    },
    include: {
      juryApplication: {
        select: {
          id: true,
          expertiseAreas: true,
        },
      },
    },
  });

  if (!account?.juryApplication) {
    redirect("/");
  }

  return {
    id: account.id,
    email: account.email,
    juryApplicationId: account.juryApplication.id,
    expertiseAreas: account.juryApplication.expertiseAreas,
  } satisfies JuryAuthUser;
}

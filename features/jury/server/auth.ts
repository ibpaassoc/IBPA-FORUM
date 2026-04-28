import "server-only";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { redirect } from "next/navigation";
import { getJurySession } from "@/auth";
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

export async function requireJuryAuth() {
  const session = await getJurySession();

  if (!session?.user?.email || !session.user.juryApplicationId) {
    redirect("/jury/login");
  }

  return {
    id: session.user.id,
    email: session.user.email,
    juryApplicationId: session.user.juryApplicationId,
    expertiseAreas: session.user.expertiseAreas ?? [],
  } satisfies JuryAuthUser;
}

import "server-only";

import { Prisma } from "@prisma/client";
import { prisma, unscopedPrisma } from "@/shared/lib/prisma";
import { runWithDataScope } from "@/features/test/server/data-scope";
import {
  createPasswordHash,
  isStrongPassword,
  normalizeAccountEmail,
} from "@/features/account/server/password";
import {
  createAccountSetupToken,
  createPasswordResetToken,
} from "@/features/account/server/tokens";
import {
  getAccountPasswordResetUrl,
  getAccountSetupUrl,
  sendAccountPasswordResetEmail,
} from "@/features/account/server/emails";
import { sendSetupEmailForAccount } from "@/features/account/server/accounts";
import { getCategoryScoringDefinition } from "@/features/jury/scoring/category-scoring";

export type DevAccountRole = "APPLICANT" | "JURY";

type CreateDevAccountInput = {
  role: DevAccountRole;
  email: string;
  fullName: string;
  password?: string;
  awardIds?: string[];
  categoryNames?: string[];
};

function devScope<T>(work: () => T | PromiseLike<T>) {
  return runWithDataScope({ dataScope: "DEV" }, work);
}

function uniqueValues(values: string[] | undefined) {
  return [...new Set((values ?? []).map((value) => value.trim()).filter(Boolean))];
}

async function requireDevAccount(accountId: string) {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: { applicantProfile: true, juryProfile: true },
  });
  if (!account) throw new Error("DEV account not found.");
  return account;
}

export async function getDevAccountsDashboard() {
  return devScope(async () => {
    const [accounts, categories] = await Promise.all([
      prisma.account.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        include: {
          applicantProfile: {
            include: {
              nominations: {
                where: { deletedAt: null },
                orderBy: { createdAt: "asc" },
                include: { category: true, award: true },
              },
            },
          },
          juryProfile: {
            include: { juryApplication: true },
          },
        },
      }),
      prisma.category.findMany({
        orderBy: { name: "asc" },
        include: { awards: { orderBy: { name: "asc" } } },
      }),
    ]);

    return { accounts, categories };
  });
}

export async function createDevAccount(input: CreateDevAccountInput) {
  const email = normalizeAccountEmail(input.email);
  const fullName = input.fullName.trim();
  const password = input.password?.trim() ?? "";
  const awardIds = uniqueValues(input.awardIds);
  const categoryNames = uniqueValues(input.categoryNames);

  if (!email || !email.includes("@")) throw new Error("Enter a valid email address.");
  if (!fullName) throw new Error("Full name is required.");
  if (password && !isStrongPassword(password)) {
    throw new Error("Password must be at least 8 characters long.");
  }

  const existing = await unscopedPrisma.account.findUnique({
    where: { email },
    select: { dataScope: true },
  });
  if (existing) {
    throw new Error(`That email already belongs to a ${existing.dataScope} account.`);
  }

  const passwordHash = password ? await createPasswordHash(password) : null;

  return devScope(async () => {
    const categories = await prisma.category.findMany({
      where: input.role === "JURY" ? { name: { in: categoryNames } } : undefined,
      select: { name: true },
    });
    if (input.role === "JURY" && categories.length !== categoryNames.length) {
      throw new Error("One or more selected jury categories no longer exist.");
    }

    const awards = input.role === "APPLICANT"
      ? await prisma.award.findMany({
          where: { id: { in: awardIds } },
          include: { category: true },
        })
      : [];
    if (input.role === "APPLICANT" && awards.length !== awardIds.length) {
      throw new Error("One or more selected nominations no longer exist.");
    }

    return prisma.$transaction(async (tx) => {
      if (input.role === "APPLICANT") {
        const account = await tx.account.create({
          data: {
            email,
            role: "APPLICANT",
            status: passwordHash ? "ACTIVE" : "INVITED",
            passwordHash,
            dataScope: "DEV",
            applicantProfile: {
              create: {
                fullName,
                preferredLocale: "en",
                dataScope: "DEV",
              },
            },
          },
          include: { applicantProfile: true },
        });
        const profile = account.applicantProfile;
        if (!profile) throw new Error("Applicant profile creation failed.");

        for (const award of awards) {
          await tx.nominationApplication.create({
            data: {
              applicantProfileId: profile.id,
              awardId: award.id,
              categoryId: award.categoryId,
              status: "PURCHASED",
              paymentStatus: "PAID",
              paidAt: new Date(),
              amount: 0,
              currency: "usd",
              scoringSchema: getCategoryScoringDefinition(
                award.category.slug,
              ) as Prisma.InputJsonValue,
              dataScope: "DEV",
            },
          });
        }
        return account;
      }

      const approvedCategories = categories.map((category) => category.name);
      const juryApplication = await tx.juryApplication.create({
        data: {
          fullName,
          email,
          phone: "DEV account",
          country: "DEV",
          city: "DEV",
          professionalTitle: "DEV Judge",
          yearsExperience: 1,
          employerAffiliation: "IBPA DEV",
          previousJudgingExperience: false,
          expertiseAreas: approvedCategories,
          approvedCategories,
          professionalBio: "Internal DEV judge account.",
          conflictDisclosure: "Internal DEV account; no production judging.",
          confidentialityAgreementAccepted: true,
          motivation: "Development and QA",
          status: "PAID",
          paymentStatus: "PAID",
          submittedAt: new Date(),
          approvedAt: new Date(),
          paidAt: new Date(),
          dataScope: "DEV",
        },
      });

      return tx.account.create({
        data: {
          email,
          role: "JURY",
          status: passwordHash ? "ACTIVE" : "INVITED",
          passwordHash,
          dataScope: "DEV",
          juryProfile: {
            create: {
              juryApplicationId: juryApplication.id,
              fullName,
              professionalTitle: "DEV Judge",
              employerAffiliation: "IBPA DEV",
              expertiseAreas: approvedCategories,
              approvedCategories,
              professionalBio: "Internal DEV judge account.",
              approvalStatus: "PAID",
              dataScope: "DEV",
            },
          },
        },
        include: { juryProfile: true },
      });
    });
  });
}

export async function setDevAccountPassword(accountId: string, password: string) {
  if (!isStrongPassword(password)) {
    throw new Error("Password must be at least 8 characters long.");
  }
  const passwordHash = await createPasswordHash(password);
  return devScope(async () => {
    await requireDevAccount(accountId);
    await prisma.$transaction([
      prisma.account.update({
        where: { id: accountId },
        data: {
          passwordHash,
          status: "ACTIVE",
          setupTokenHash: null,
          setupTokenExpiresAt: null,
          setupTokenIssuedAt: null,
          setupTokenUsedAt: new Date(),
        },
      }),
      prisma.accountSetupToken.updateMany({
        where: { accountId, usedAt: null },
        data: { usedAt: new Date() },
      }),
    ]);
  });
}

export async function setDevAccountEnabled(accountId: string, enabled: boolean) {
  return devScope(async () => {
    await requireDevAccount(accountId);
    await prisma.account.update({
      where: { id: accountId },
      data: { status: enabled ? "ACTIVE" : "DISABLED" },
    });
  });
}

export async function updateDevJuryCategories(accountId: string, names: string[]) {
  const categoryNames = uniqueValues(names);
  return devScope(async () => {
    const account = await requireDevAccount(accountId);
    if (account.role !== "JURY" || !account.juryProfile) {
      throw new Error("DEV jury account not found.");
    }
    const categories = await prisma.category.findMany({
      where: { name: { in: categoryNames } },
      select: { name: true },
    });
    if (categories.length !== categoryNames.length) {
      throw new Error("One or more selected categories no longer exist.");
    }
    const approvedCategories = categories.map((category) => category.name);
    await prisma.$transaction([
      prisma.juryProfile.update({
        where: { id: account.juryProfile.id },
        data: { approvedCategories, expertiseAreas: approvedCategories },
      }),
      ...(account.juryProfile.juryApplicationId
        ? [
            prisma.juryApplication.update({
              where: { id: account.juryProfile.juryApplicationId },
              data: { approvedCategories, expertiseAreas: approvedCategories },
            }),
          ]
        : []),
    ]);
  });
}

export async function addDevApplicantNomination(accountId: string, awardId: string) {
  return devScope(async () => {
    const account = await requireDevAccount(accountId);
    if (account.role !== "APPLICANT" || !account.applicantProfile) {
      throw new Error("DEV applicant account not found.");
    }
    const [award, duplicate] = await Promise.all([
      prisma.award.findUnique({ where: { id: awardId }, include: { category: true } }),
      prisma.nominationApplication.findFirst({
        where: {
          applicantProfileId: account.applicantProfile.id,
          awardId,
          deletedAt: null,
        },
        select: { id: true },
      }),
    ]);
    if (!award) throw new Error("Nomination not found.");
    if (duplicate) throw new Error("This applicant already has that nomination.");
    await prisma.nominationApplication.create({
      data: {
        applicantProfileId: account.applicantProfile.id,
        awardId: award.id,
        categoryId: award.categoryId,
        status: "PURCHASED",
        paymentStatus: "PAID",
        paidAt: new Date(),
        amount: 0,
        currency: "usd",
        scoringSchema: getCategoryScoringDefinition(
          award.category.slug,
        ) as Prisma.InputJsonValue,
      },
    });
  });
}

export async function removeDevApplicantNomination(accountId: string, nominationId: string) {
  return devScope(async () => {
    const account = await requireDevAccount(accountId);
    if (!account.applicantProfile) throw new Error("DEV applicant account not found.");
    const nomination = await prisma.nominationApplication.findFirst({
      where: { id: nominationId, applicantProfileId: account.applicantProfile.id },
      select: { id: true },
    });
    if (!nomination) throw new Error("DEV nomination not found.");
    await prisma.nominationApplication.delete({ where: { id: nomination.id } });
  });
}

export async function createDevSetupLink(accountId: string) {
  return devScope(async () => {
    const account = await requireDevAccount(accountId);
    if (account.passwordHash) {
      throw new Error("This account already has a password; create a reset link instead.");
    }
    const token = await prisma.$transaction((tx) =>
      createAccountSetupToken(tx, { accountId, purpose: "SETUP" }),
    );
    return getAccountSetupUrl(token.token);
  });
}

export async function createDevResetLink(accountId: string) {
  return devScope(async () => {
    await requireDevAccount(accountId);
    const token = await createPasswordResetToken(accountId);
    return getAccountPasswordResetUrl(token.token);
  });
}

export async function sendDevSetupEmail(accountId: string) {
  return devScope(async () => {
    const account = await requireDevAccount(accountId);
    if (account.passwordHash) {
      throw new Error("This account already has a password; send a reset email instead.");
    }
    return sendSetupEmailForAccount(accountId);
  });
}

export async function sendDevResetEmail(accountId: string) {
  return devScope(async () => {
    const account = await requireDevAccount(accountId);
    const token = await createPasswordResetToken(accountId);
    const result = await sendAccountPasswordResetEmail({
      to: account.email,
      token: token.token,
    });
    await prisma.account.update({
      where: { id: accountId },
      data: {
        lastSetupEmailSentAt: new Date(),
        lastSetupEmailDeliveryStatus: result.delivered
          ? "delivered"
          : result.reason ?? "failed",
        lastSetupEmailDeliveryError: result.delivered
          ? null
          : result.error ?? result.reason ?? "Email delivery failed.",
      },
    });
    return result;
  });
}

export async function deleteDevAccount(accountId: string) {
  return devScope(async () => {
    const account = await requireDevAccount(accountId);
    await prisma.$transaction(async (tx) => {
      if (account.juryProfile?.juryApplicationId) {
        await tx.juryApplication.delete({
          where: { id: account.juryProfile.juryApplicationId },
        });
      }
      await tx.account.delete({ where: { id: accountId } });
    });
  });
}

import "server-only";

import { Prisma } from "@prisma/client";
import { prisma, unscopedPrisma } from "@/shared/lib/prisma";
import { runWithDataScope } from "@/features/test/server/data-scope";
import { createPasswordHash, isStrongPassword, normalizeAccountEmail } from "@/features/account/server/password";
import { createAccountSetupToken, createPasswordResetToken } from "@/features/account/server/tokens";
import { getAccountPasswordResetUrl, getAccountSetupUrl, sendAccountPasswordResetEmail } from "@/features/account/server/emails";
import { sendSetupEmailForAccount, accountIdentity } from "@/features/account/server/accounts";
import { getCategoryScoringDefinition } from "@/features/jury/scoring/category-scoring";
import { emptyNominationAnswers, emptyStoredFiles, emptyJuryInformationRequests } from "@/features/database/json-fields";

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
    include: { applicantProfile: true, juryProfile: true, juryApplication: true },
  });
  if (!account) throw new Error("DEV account not found.");
  return account;
}

export async function getDevAccountsDashboard() {
  return devScope(async () => {
    const [accounts, categories] = await Promise.all([
      prisma.account.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          applicantProfile: { include: { nominations: { orderBy: { createdAt: "asc" }, include: { category: true, award: true } } } },
          juryProfile: { include: { juryApplication: true } },
        },
      }),
      prisma.category.findMany({ orderBy: { name: "asc" }, include: { awards: { orderBy: { name: "asc" } } } }),
    ]);
    return { accounts, categories };
  });
}

async function createPaidDevNomination(
  tx: Prisma.TransactionClient,
  input: { accountId: string; applicantProfileId: string; email: string; award: { id: string; categoryId: string; category: { slug: string } } },
) {
  const now = new Date();
  const payment = await tx.payment.create({
    data: {
      accountId: input.accountId,
      customerEmail: input.email,
      amount: 0,
      currency: "usd",
      status: "PAID",
      purchaseType: "NOMINATION",
      provider: "MANUAL",
      pricingSnapshot: { schemaVersion: 1, reason: "dev-account" },
      paidAt: now,
      fulfilledAt: now,
      dataScope: "DEV",
    },
  });
  return tx.nomination.create({
    data: {
      applicantProfileId: input.applicantProfileId,
      paymentId: payment.id,
      awardId: input.award.id,
      categoryId: input.award.categoryId,
      status: "DRAFT",
      answers: emptyNominationAnswers() as unknown as Prisma.InputJsonValue,
      files: emptyStoredFiles() as unknown as Prisma.InputJsonValue,
      scoringSchema: getCategoryScoringDefinition(input.award.category.slug) as Prisma.InputJsonValue,
      dataScope: "DEV",
    },
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
  if (password && !isStrongPassword(password)) throw new Error("Password must be at least 8 characters long.");
  const existing = await unscopedPrisma.account.findUnique({ where: accountIdentity(email, input.role), select: { dataScope: true } });
  if (existing) throw new Error(`That email already belongs to a ${input.role.toLowerCase()} ${existing.dataScope} account.`);
  const passwordHash = password ? await createPasswordHash(password) : null;

  return devScope(async () => {
    const categories = input.role === "JURY"
      ? await prisma.category.findMany({ where: { name: { in: categoryNames } }, select: { name: true } })
      : [];
    if (input.role === "JURY" && categories.length !== categoryNames.length) throw new Error("One or more selected jury categories no longer exist.");
    const awards = input.role === "APPLICANT"
      ? await prisma.award.findMany({ where: { id: { in: awardIds } }, include: { category: true } })
      : [];
    if (input.role === "APPLICANT" && awards.length !== awardIds.length) throw new Error("One or more selected nominations no longer exist.");

    return prisma.$transaction(async (tx) => {
      const account = await tx.account.create({
        data: { email, normalizedEmail: email, role: input.role, status: passwordHash ? "ACTIVE" : "INVITED", passwordHash, dataScope: "DEV" },
      });
      if (input.role === "APPLICANT") {
        const profile = await tx.applicantProfile.create({ data: { accountId: account.id, fullName, preferredLocale: "en", dataScope: "DEV" } });
        for (const award of awards) await createPaidDevNomination(tx, { accountId: account.id, applicantProfileId: profile.id, email, award });
      } else {
        const approvedCategories = categories.map((category) => category.name);
        const application = await tx.juryApplication.create({
          data: {
            accountId: account.id,
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
            professionalBio: "Internal DEV judge account.",
            conflictDisclosure: "Internal DEV account; no production judging.",
            motivation: "Development and QA",
            status: "PAID",
            informationRequests: emptyJuryInformationRequests() as unknown as Prisma.InputJsonValue,
            files: emptyStoredFiles() as unknown as Prisma.InputJsonValue,
            submittedAt: new Date(),
            approvedAt: new Date(),
            dataScope: "DEV",
          },
        });
        await tx.juryProfile.create({
          data: {
            accountId: account.id,
            juryApplicationId: application.id,
            fullName,
            professionalTitle: "DEV Judge",
            employerAffiliation: "IBPA DEV",
            expertiseAreas: approvedCategories,
            approvedCategories,
            professionalBio: "Internal DEV judge account.",
            dataScope: "DEV",
          },
        });
        await tx.payment.create({
          data: {
            accountId: account.id,
            juryApplicationId: application.id,
            customerEmail: email,
            amount: 0,
            currency: "usd",
            status: "PAID",
            purchaseType: "JURY",
            provider: "MANUAL",
            paidAt: new Date(),
            fulfilledAt: new Date(),
            dataScope: "DEV",
          },
        });
      }
      return tx.account.findUniqueOrThrow({ where: { id: account.id }, include: { applicantProfile: true, juryProfile: true } });
    });
  });
}

export async function setDevAccountPassword(accountId: string, password: string) {
  if (!isStrongPassword(password)) throw new Error("Password must be at least 8 characters long.");
  const passwordHash = await createPasswordHash(password);
  return devScope(async () => {
    await requireDevAccount(accountId);
    return prisma.account.update({
      where: { id: accountId },
      data: {
        passwordHash,
        status: "ACTIVE",
        setupTokenHash: null,
        setupTokenPurpose: null,
        setupTokenExpiresAt: null,
        setupTokenIssuedAt: null,
        setupTokenUsedAt: new Date(),
      },
    });
  });
}

export async function setDevAccountEnabled(accountId: string, enabled: boolean) {
  return devScope(async () => {
    await requireDevAccount(accountId);
    return prisma.account.update({ where: { id: accountId }, data: { status: enabled ? "ACTIVE" : "DISABLED" } });
  });
}

export async function updateDevJuryCategories(accountId: string, names: string[]) {
  const categoryNames = uniqueValues(names);
  return devScope(async () => {
    const account = await requireDevAccount(accountId);
    if (account.role !== "JURY" || !account.juryProfile) throw new Error("DEV jury account not found.");
    const categories = await prisma.category.findMany({ where: { name: { in: categoryNames } }, select: { name: true } });
    if (categories.length !== categoryNames.length) throw new Error("One or more selected categories no longer exist.");
    const approvedCategories = categories.map((category) => category.name);
    await prisma.$transaction([
      prisma.juryProfile.update({ where: { id: account.juryProfile.id }, data: { approvedCategories, expertiseAreas: approvedCategories } }),
      prisma.juryApplication.update({ where: { id: account.juryProfile.juryApplicationId }, data: { expertiseAreas: approvedCategories } }),
    ]);
  });
}

export async function addDevApplicantNomination(accountId: string, awardId: string) {
  return devScope(async () => {
    const account = await requireDevAccount(accountId);
    if (account.role !== "APPLICANT" || !account.applicantProfile) throw new Error("DEV applicant account not found.");
    const [award, duplicate] = await Promise.all([
      prisma.award.findUnique({ where: { id: awardId }, include: { category: true } }),
      prisma.nomination.findFirst({ where: { applicantProfileId: account.applicantProfile.id, awardId, status: { not: "ARCHIVED" } }, select: { id: true } }),
    ]);
    if (!award) throw new Error("Nomination not found.");
    if (duplicate) throw new Error("This applicant already has that nomination.");
    await prisma.$transaction((tx) => createPaidDevNomination(tx, { accountId, applicantProfileId: account.applicantProfile!.id, email: account.email, award }));
  });
}

export async function removeDevApplicantNomination(accountId: string, nominationId: string) {
  return devScope(async () => {
    const account = await requireDevAccount(accountId);
    if (!account.applicantProfile) throw new Error("DEV applicant account not found.");
    const nomination = await prisma.nomination.findFirst({ where: { id: nominationId, applicantProfileId: account.applicantProfile.id }, select: { id: true, paymentId: true } });
    if (!nomination) throw new Error("DEV nomination not found.");
    await prisma.$transaction(async (tx) => {
      await tx.nomination.delete({ where: { id: nomination.id } });
      await tx.payment.delete({ where: { id: nomination.paymentId } });
    });
  });
}

export async function createDevSetupLink(accountId: string) {
  return devScope(async () => {
    const account = await requireDevAccount(accountId);
    if (account.passwordHash) throw new Error("This account already has a password; create a reset link instead.");
    const token = await prisma.$transaction((tx) => createAccountSetupToken(tx, { accountId, purpose: "SETUP" }));
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
    if (account.passwordHash) throw new Error("This account already has a password; send a reset email instead.");
    return sendSetupEmailForAccount(accountId);
  });
}

export async function sendDevResetEmail(accountId: string) {
  return devScope(async () => {
    const account = await requireDevAccount(accountId);
    const token = await createPasswordResetToken(accountId);
    const result = await sendAccountPasswordResetEmail({ to: account.email, token: token.token });
    await prisma.account.update({
      where: { id: accountId },
      data: {
        lastSetupEmailSentAt: new Date(),
        lastSetupEmailDeliveryStatus: result.delivered ? "delivered" : result.reason ?? "failed",
        lastSetupEmailDeliveryError: result.delivered ? null : result.error ?? result.reason ?? "Email delivery failed.",
      },
    });
    return result;
  });
}

export async function deleteDevAccount(accountId: string) {
  return devScope(async () => {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: {
        applicantProfile: { include: { nominations: { select: { id: true, paymentId: true } }, tickets: { select: { id: true, paymentId: true } } } },
        juryProfile: { include: { reviews: { select: { id: true } } } },
        juryApplication: true,
        payments: { select: { id: true } },
        tickets: { select: { id: true } },
      },
    });
    if (!account) throw new Error("DEV account not found.");
    await prisma.$transaction(async (tx) => {
      if (account.juryProfile) {
        await tx.juryNominationReview.deleteMany({ where: { juryProfileId: account.juryProfile.id } });
      }
      await tx.ticket.deleteMany({ where: { OR: [{ accountId }, { applicantProfileId: account.applicantProfile?.id ?? "__none__" }] } });
      await tx.nomination.deleteMany({ where: { applicantProfileId: account.applicantProfile?.id ?? "__none__" } });
      await tx.payment.deleteMany({ where: { accountId } });
      if (account.juryProfile) await tx.juryProfile.delete({ where: { id: account.juryProfile.id } });
      if (account.applicantProfile) await tx.applicantProfile.delete({ where: { id: account.applicantProfile.id } });
      if (account.juryApplication) await tx.juryApplication.delete({ where: { id: account.juryApplication.id } });
      await tx.account.delete({ where: { id: accountId } });
    });
  });
}

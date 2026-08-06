"use server";

import { redirect } from "next/navigation";
import { createAccountSetupToken } from "@/features/account/server/tokens";
import { accountIdentity, requireJuryAccount } from "@/features/account/server/accounts";
import { getAccountSetupUrl } from "@/features/account/server/emails";
import { prisma } from "@/shared/lib/prisma";

/** Creates an independent Applicant account and leaves the signed-in Jury untouched. */
export async function startApplicantOnboardingFromJury() {
  const { account: juryAccount, juryProfile } = await requireJuryAccount();

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.account.findUnique({
      where: accountIdentity(juryAccount.normalizedEmail, "APPLICANT"),
      select: { id: true },
    });
    if (existing) return { existing: true as const };

    const applicant = await tx.account.create({
      data: {
        email: juryAccount.email,
        normalizedEmail: juryAccount.normalizedEmail,
        role: "APPLICANT",
        status: "INVITED",
        dataScope: juryAccount.dataScope,
        applicantProfile: {
          create: {
            fullName: juryProfile.fullName,
            phone: juryProfile.phone,
            country: juryProfile.country,
            city: juryProfile.city,
            professionalTitle: juryProfile.professionalTitle,
            yearsExperience: juryProfile.yearsExperience,
            preferredLocale: "en",
            dataScope: juryAccount.dataScope,
          },
        },
      },
      select: { id: true },
    });
    const token = await createAccountSetupToken(tx, { accountId: applicant.id, purpose: "SETUP" });
    return { existing: false as const, setupUrl: getAccountSetupUrl(token.token) };
  });

  if (result.existing) redirect("/login?role=applicant");
  redirect(result.setupUrl);
}

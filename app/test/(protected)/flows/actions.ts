"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { reopenJudgeScore } from "@/features/admin/server/admin";
import {
  createApplicantScenario,
  createFullFlowScenario,
  createJuryScenario,
  type ApplicantScenarioKind,
  type JuryScenarioKind,
} from "@/features/test/server/scenarios";
import { createTestActor, requireTestSession } from "@/features/test/server/auth";
import { runWithDataScope } from "@/features/test/server/data-scope";
import { prisma } from "@/shared/lib/prisma";

const applicantKinds = new Set<ApplicantScenarioKind>([
  "applicant-empty",
  "applicant-draft",
  "applicant-incomplete",
  "applicant-submitted",
  "applicant-multiple",
  "applicant-upload-failure",
]);

const juryKinds = new Set<JuryScenarioKind>([
  "jury-empty",
  "jury-unreviewed",
  "jury-partial",
  "jury-submitted",
]);

export async function createApplicantScenarioAction(formData: FormData) {
  await requireTestSession();
  const kind = String(formData.get("kind") ?? "") as ApplicantScenarioKind;
  if (!applicantKinds.has(kind)) throw new Error("Unknown applicant test scenario.");
  const result = await createApplicantScenario(kind);
  redirect(`/test/applicant?created=${result.scenario.id}`);
}

export async function createJuryScenarioAction(formData: FormData) {
  await requireTestSession();
  const kind = String(formData.get("kind") ?? "") as JuryScenarioKind;
  if (!juryKinds.has(kind)) throw new Error("Unknown jury test scenario.");
  const result = await createJuryScenario(kind);
  redirect(`/test/jury?created=${result.scenario.id}`);
}

export async function createFullFlowScenarioAction() {
  await requireTestSession();
  const result = await createFullFlowScenario();
  redirect(`/test/applicant?created=${result.scenario.id}&full=1`);
}

export async function openTestAccountAction(formData: FormData) {
  await requireTestSession();
  const accountId = String(formData.get("accountId") ?? "");
  const account = await runWithDataScope({ dataScope: "TEST" }, () =>
    prisma.account.findUnique({ where: { id: accountId }, select: { id: true, role: true, status: true } }),
  );
  if (!account || account.status === "DISABLED") throw new Error("Test account not found or disabled.");
  await createTestActor({ accountId: account.id, role: account.role });
  redirect(account.role === "JURY" ? "/account/jury" : "/account/applicant");
}

export async function reassignTestJuryAction(formData: FormData) {
  await requireTestSession();
  const accountId = String(formData.get("accountId") ?? "");
  const nominationId = String(formData.get("nominationId") ?? "");
  await runWithDataScope({ dataScope: "TEST" }, async () => {
    const [account, nomination] = await Promise.all([
      prisma.account.findUnique({ where: { id: accountId }, include: { juryProfile: true } }),
      prisma.nominationApplication.findUnique({ where: { id: nominationId }, include: { category: true } }),
    ]);
    if (!account?.juryProfile || account.role !== "JURY" || !nomination) {
      throw new Error("Both the jury account and nomination must be test-scoped records.");
    }
    await prisma.juryProfile.update({
      where: { id: account.juryProfile.id },
      data: { approvedCategories: [nomination.category.name], expertiseAreas: [nomination.category.name] },
    });
  });
  revalidatePath("/test/jury");
}

export async function reopenTestNominationAction(formData: FormData) {
  await requireTestSession();
  const nominationId = String(formData.get("nominationId") ?? "");
  await runWithDataScope({ dataScope: "TEST" }, async () => {
    const nomination = await prisma.nominationApplication.findUnique({ where: { id: nominationId } });
    if (!nomination) throw new Error("Only a test-scoped nomination can be reopened here.");
    await prisma.nominationApplication.update({
      where: { id: nomination.id },
      data: { status: "RETURNED_FOR_CHANGES", lockedAt: null },
    });
  });
  revalidatePath("/test/applicant");
}

export async function reopenTestReviewAction(formData: FormData) {
  await requireTestSession();
  const reviewId = String(formData.get("reviewId") ?? "");
  await runWithDataScope({ dataScope: "TEST" }, async () => {
    const review = await prisma.juryNominationReview.findUnique({ where: { id: reviewId } });
    if (!review) throw new Error("Only a test-scoped review can be reopened here.");
    await reopenJudgeScore(review.id);
  });
  revalidatePath("/test/jury");
}


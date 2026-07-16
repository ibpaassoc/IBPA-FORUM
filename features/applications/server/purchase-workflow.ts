import "server-only";

import { Prisma } from "@prisma/client";
import { normalizeAccountEmail } from "@/features/account/server/password";
import { computeApplicantNominationPrice } from "@/features/applications/lib/pricing";
import {
  getApplicantApplicationsClosedAt,
  getApplicantSubmissionDeadline,
} from "@/features/applications/server/deadlines";
import { validateMembershipNumber } from "@/features/applications/server/membership";
import { getApplicationCategories } from "@/features/applications/server/queries";
import type { CategoryOption } from "@/features/applications/types/application.types";
import { createApplicantNominationCheckoutSession } from "@/features/payments/server/checkout-sessions";
import {
  getStripePromoDiscountId,
  PromoCodeError,
  validatePromoCodeForFlow,
} from "@/features/promos/server/promo-service";
import { prisma } from "@/shared/lib/prisma";

export const APPLICANT_NOMINATION_PURCHASE_FLOW = "applicant_nomination_purchase";
export const APPLICANT_PURCHASE_MANIFEST_VERSION = 1;

export class ApplicantPurchaseError extends Error {
  status: number;
  code: string;
  fieldErrors?: Record<string, string>;

  constructor(status: number, code: string, message: string, fieldErrors?: Record<string, string>) {
    super(message);
    this.name = "ApplicantPurchaseError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export type ApplicantPurchaseManifest = {
  version: typeof APPLICANT_PURCHASE_MANIFEST_VERSION;
  flowType: typeof APPLICANT_NOMINATION_PURCHASE_FLOW;
  source: "public_apply" | "applicant_account" | "admin_manual";
  locale: "en" | "ru" | "ua";
  createdAt: string;
  applicantProfileId?: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone?: string | null;
    country?: string | null;
    stateProvince?: string | null;
    city?: string | null;
    professionalTitle?: string | null;
    yearsExperience?: number | null;
    websiteUrl?: string | null;
    socialUrl?: string | null;
    reviewsUrl?: string | null;
  };
  membership: {
    isVerifiedMember: boolean;
    membershipNumber?: string | null;
    membershipLevel?: string | null;
    verificationSource?: string | null;
    verifiedAt?: string | null;
  };
  selectedAwards: Array<{
    awardId: string;
    awardName: string;
    categoryId: string;
    categoryName: string;
    categorySlug: string;
  }>;
  pricing: {
    amountCents: number;
    originalAmountCents?: number;
    discountAmountCents?: number;
    currency: "usd";
    nominationCount: number;
    billableCount: number;
    isIbpaMember: boolean;
    promoCodeKey?: string | null;
    promoCodeKeyword?: string | null;
    promoDiscountPercent?: number | null;
  };
};

type PublicPurchaseInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country: string;
  countryOther?: string;
  stateProvince?: string;
  city: string;
  professionalTitle?: string;
  yearsExperience?: string;
  websiteUrl?: string;
  socialUrl?: string;
  reviewsUrl?: string;
  isIbpaMember: boolean;
  ibpaMemberNumber?: string;
  locale: "en" | "ru" | "ua";
  selectedAwardIds: string[];
  promoCode?: string;
  agreementsAccepted: boolean;
};

function coerceLocale(value: string | null | undefined): "en" | "ru" | "ua" {
  return value === "ru" || value === "ua" ? value : "en";
}

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getBool(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim().toLowerCase();
  return value === "true" || value === "on" || value === "1" || value === "yes";
}

async function assertApplicantPurchasingOpen() {
  const [deadline, closedAt] = await Promise.all([
    getApplicantSubmissionDeadline(),
    getApplicantApplicationsClosedAt(),
  ]);

  if (closedAt || deadline <= new Date()) {
    throw new ApplicantPurchaseError(
      409,
      "APPLICATIONS_CLOSED",
      "Applications are closed for this competition."
    );
  }
}

async function resolveApplicationPromo(keyword: string | null | undefined, amountCents: number) {
  try {
    return await validatePromoCodeForFlow({
      keyword,
      paymentFlow: "APPLICATIONS",
      amountCents,
    });
  } catch (error) {
    if (error instanceof PromoCodeError) {
      throw new ApplicantPurchaseError(
        error.code === "DISABLED" ? 409 : 400,
        `PROMO_${error.code}`,
        error.message,
        { promoCode: error.message }
      );
    }
    throw error;
  }
}

export function parsePublicPurchaseForm(formData: FormData): PublicPurchaseInput {
  const agreementsAccepted =
    getBool(formData, "rulesAccepted") &&
    getBool(formData, "privacyAccepted") &&
    getBool(formData, "paymentTermsAccepted") &&
    getBool(formData, "refundNoticeAccepted");

  return {
    firstName: getString(formData, "firstName"),
    lastName: getString(formData, "lastName"),
    email: getString(formData, "email"),
    phone: getString(formData, "phone"),
    country: getString(formData, "country"),
    countryOther: getString(formData, "countryOther"),
    stateProvince: getString(formData, "stateProvince"),
    city: getString(formData, "city"),
    professionalTitle: getString(formData, "professionalTitle"),
    yearsExperience: getString(formData, "yearsExperience"),
    websiteUrl: getString(formData, "websiteUrl"),
    socialUrl: getString(formData, "socialUrl"),
    reviewsUrl: getString(formData, "reviewsUrl"),
    isIbpaMember: getBool(formData, "isIbpaMember"),
    ibpaMemberNumber: getString(formData, "ibpaMemberNumber"),
    locale: coerceLocale(getString(formData, "locale")),
    selectedAwardIds: formData
      .getAll("selectedAwardIds")
      .map((item) => String(item).trim())
      .filter(Boolean),
    promoCode: getString(formData, "promoCode"),
    agreementsAccepted,
  };
}

function validatePublicInput(input: PublicPurchaseInput) {
  const errors: Record<string, string> = {};
  if (!input.firstName) errors.firstName = "First name is required.";
  if (!input.lastName) errors.lastName = "Last name is required.";
  if (!input.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.email)) {
    errors.email = "A valid email is required.";
  }
  if (!input.phone) errors.phone = "Phone / WhatsApp is required.";
  if (!input.country) errors.country = "Country is required.";
  if (input.country === "Other" && !input.countryOther) {
    errors.countryOther = "Please enter your country.";
  }
  if (input.country === "USA" && !input.stateProvince) {
    errors.stateProvince = "State / Province is required when country is USA.";
  }
  if (!input.city) errors.city = "City is required.";
  if (!input.professionalTitle) errors.professionalTitle = "Professional title is required.";
  const yearsExperience = input.yearsExperience ? Number(input.yearsExperience) : Number.NaN;
  if (!Number.isInteger(yearsExperience) || yearsExperience < 2) {
    errors.yearsExperience = "A minimum of 2 years of professional experience is required.";
  }
  if (input.selectedAwardIds.length === 0) {
    errors.selectedAwardIds = "Please choose at least one nomination.";
  }
  if (new Set(input.selectedAwardIds).size !== input.selectedAwardIds.length) {
    errors.selectedAwardIds = "Each nomination can only be selected once.";
  }
  if (!input.agreementsAccepted) {
    errors.agreements = "Please accept all required agreements before checkout.";
  }

  if (Object.keys(errors).length > 0) {
    throw new ApplicantPurchaseError(400, "VALIDATION_ERROR", "Please review the highlighted fields.", errors);
  }

  return {
    yearsExperience,
    country: input.country === "Other" ? (input.countryOther ?? "").trim() : input.country,
  };
}

function resolveSelectedAwards(categories: CategoryOption[], selectedAwardIds: string[]) {
  const selectedAwards = selectedAwardIds.map((awardId) => {
    for (const category of categories) {
      const award = category.awards.find((item) => item.id === awardId);
      if (award) {
        return {
          awardId: award.id,
          awardName: award.name,
          categoryId: category.id,
          categoryName: category.name,
          categorySlug: category.slug,
        };
      }
    }
    return null;
  });

  if (selectedAwards.some((item) => item === null)) {
    throw new ApplicantPurchaseError(
      400,
      "INVALID_NOMINATION",
      "One or more selected nominations are invalid.",
      { selectedAwardIds: "One or more selected nominations are invalid." }
    );
  }

  return selectedAwards as NonNullable<(typeof selectedAwards)[number]>[];
}

async function assertNoOwnedDuplicateNominations({
  applicantProfileId,
  awardIds,
}: {
  applicantProfileId: string;
  awardIds: string[];
}) {
  const duplicates = await prisma.nominationApplication.findMany({
    where: {
      applicantProfileId,
      awardId: { in: awardIds },
      deletedAt: null,
    },
    select: {
      awardId: true,
      award: { select: { name: true } },
    },
  });

  if (duplicates.length > 0) {
    throw new ApplicantPurchaseError(
      409,
      "DUPLICATE_NOMINATION",
      "You already have this nomination.",
      Object.fromEntries(duplicates.map((item) => [item.awardId, "You already have this nomination."]))
    );
  }
}

export async function createPublicApplicantNominationCheckout(formData: FormData) {
  await assertApplicantPurchasingOpen();
  const input = parsePublicPurchaseForm(formData);
  const normalized = validatePublicInput(input);
  const categories = await getApplicationCategories();
  const selectedAwards = resolveSelectedAwards(categories, Array.from(new Set(input.selectedAwardIds)));
  const email = normalizeAccountEmail(input.email);
  const fullName = `${input.firstName.trim()} ${input.lastName.trim()}`.trim();

  const existingAccount = await prisma.account.findUnique({
    where: { email },
    select: {
      id: true,
      role: true,
      status: true,
      passwordHash: true,
      applicantProfile: { select: { id: true } },
    },
  });

  if (existingAccount && existingAccount.role !== "APPLICANT") {
    throw new ApplicantPurchaseError(
      409,
      "ACCOUNT_ROLE_CONFLICT",
      "This email is already registered for a different account type."
    );
  }

  if (existingAccount?.applicantProfile?.id) {
    await assertNoOwnedDuplicateNominations({
      applicantProfileId: existingAccount.applicantProfile.id,
      awardIds: selectedAwards.map((item) => item.awardId),
    });
  }

  const membership = input.isIbpaMember
    ? await validateMembershipNumber(input.ibpaMemberNumber ?? "")
    : null;
  const isVerifiedMember = Boolean(membership?.qualified);
  const pricing = computeApplicantNominationPrice({
    nominationCount: selectedAwards.length,
    isIbpaMember: isVerifiedMember,
  });
  const appliedPromo = await resolveApplicationPromo(input.promoCode, pricing.amountCents);
  const finalAmountCents = appliedPromo?.finalAmountCents ?? pricing.amountCents;
  const promoDiscountId = appliedPromo ? getStripePromoDiscountId(appliedPromo.key) : null;

  const manifest: ApplicantPurchaseManifest = {
    version: APPLICANT_PURCHASE_MANIFEST_VERSION,
    flowType: APPLICANT_NOMINATION_PURCHASE_FLOW,
    source: "public_apply",
    locale: input.locale,
    createdAt: new Date().toISOString(),
    applicantProfileId: existingAccount?.applicantProfile?.id,
    personalInfo: {
      fullName,
      email,
      phone: input.phone || null,
      country: normalized.country || null,
      stateProvince: input.stateProvince || null,
      city: input.city || null,
      professionalTitle: input.professionalTitle || null,
      yearsExperience: normalized.yearsExperience,
      websiteUrl: input.websiteUrl || null,
      socialUrl: input.socialUrl || null,
      reviewsUrl: input.reviewsUrl || null,
    },
    membership: {
      isVerifiedMember,
      membershipNumber: isVerifiedMember ? membership?.membershipNumber ?? null : null,
      membershipLevel: isVerifiedMember ? membership?.membershipLevel ?? null : null,
      verificationSource: isVerifiedMember ? membership?.source ?? null : null,
      verifiedAt: isVerifiedMember ? new Date().toISOString() : null,
    },
    selectedAwards,
    pricing: {
      amountCents: finalAmountCents,
      originalAmountCents: pricing.amountCents,
      discountAmountCents: appliedPromo?.discountAmountCents ?? 0,
      currency: pricing.currency,
      nominationCount: pricing.nominationCount,
      billableCount: pricing.billableCount,
      isIbpaMember: pricing.isIbpaMember,
      promoCodeKey: appliedPromo?.key ?? null,
      promoCodeKeyword: appliedPromo?.keyword ?? null,
      promoDiscountPercent: appliedPromo?.discountPercent ?? null,
    },
  };

  const payment = await prisma.payment.create({
    data: {
      source: "COMPETITOR",
      applicantProfileId: existingAccount?.applicantProfile?.id,
      applicantEmail: email,
      provider: "stripe",
      purchaseManifest: manifest as unknown as Prisma.InputJsonValue,
      amount: finalAmountCents,
      currency: pricing.currency,
      promoCodeKey: appliedPromo?.key,
      promoCodeKeyword: appliedPromo?.keyword,
      promoDiscountPercent: appliedPromo?.discountPercent,
      promoDiscountAmount: appliedPromo?.discountAmountCents,
      status: "PENDING",
    },
    select: { id: true },
  });

  const checkoutSession = await createApplicantNominationCheckoutSession({
    paymentId: payment.id,
    email,
    originalAmountCents: pricing.amountCents,
    finalAmountCents,
    currency: pricing.currency,
    nominationCount: selectedAwards.length,
    promoDiscountId,
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { stripeSessionId: checkoutSession.id },
  });

  return {
    paymentId: payment.id,
    checkoutUrl: checkoutSession.url,
    amount: finalAmountCents,
    currency: pricing.currency,
  };
}

export async function createAccountApplicantNominationCheckout({
  applicantProfileId,
  awardIds,
  promoCode,
}: {
  applicantProfileId: string;
  awardIds: string[];
  promoCode?: string | null;
}) {
  await assertApplicantPurchasingOpen();
  const selectedAwardIds = Array.from(new Set(awardIds.map((id) => id.trim()).filter(Boolean)));
  if (selectedAwardIds.length === 0) {
    throw new ApplicantPurchaseError(400, "VALIDATION_ERROR", "Please choose at least one nomination.", {
      selectedAwardIds: "Please choose at least one nomination.",
    });
  }

  const [categories, profile] = await Promise.all([
    getApplicationCategories(),
    prisma.applicantProfile.findUnique({
      where: { id: applicantProfileId },
      include: { account: true },
    }),
  ]);

  if (!profile || profile.account.status === "DISABLED" || profile.deletedAt) {
    throw new ApplicantPurchaseError(404, "ACCOUNT_NOT_FOUND", "Applicant account not found.");
  }

  const selectedAwards = resolveSelectedAwards(categories, selectedAwardIds);
  await assertNoOwnedDuplicateNominations({
    applicantProfileId: profile.id,
    awardIds: selectedAwards.map((item) => item.awardId),
  });

  const isVerifiedMember = Boolean(profile.membershipNumber && profile.membershipLevel);
  const pricing = computeApplicantNominationPrice({
    nominationCount: selectedAwards.length,
    isIbpaMember: isVerifiedMember,
  });
  const appliedPromo = await resolveApplicationPromo(promoCode, pricing.amountCents);
  const finalAmountCents = appliedPromo?.finalAmountCents ?? pricing.amountCents;
  const promoDiscountId = appliedPromo ? getStripePromoDiscountId(appliedPromo.key) : null;

  const manifest: ApplicantPurchaseManifest = {
    version: APPLICANT_PURCHASE_MANIFEST_VERSION,
    flowType: APPLICANT_NOMINATION_PURCHASE_FLOW,
    source: "applicant_account",
    locale: coerceLocale(profile.preferredLocale),
    createdAt: new Date().toISOString(),
    applicantProfileId: profile.id,
    personalInfo: {
      fullName: profile.fullName,
      email: profile.account.email,
      phone: profile.phone,
      country: profile.country,
      stateProvince: profile.stateProvince,
      city: profile.city,
      professionalTitle: profile.professionalTitle,
      yearsExperience: profile.yearsExperience,
      websiteUrl: profile.websiteUrl,
      socialUrl: profile.socialUrl,
      reviewsUrl: profile.reviewsUrl,
    },
    membership: {
      isVerifiedMember,
      membershipNumber: isVerifiedMember ? profile.membershipNumber : null,
      membershipLevel: isVerifiedMember ? profile.membershipLevel : null,
      verificationSource: profile.membershipVerificationSource,
      verifiedAt: profile.membershipVerifiedAt?.toISOString() ?? null,
    },
    selectedAwards,
    pricing: {
      amountCents: finalAmountCents,
      originalAmountCents: pricing.amountCents,
      discountAmountCents: appliedPromo?.discountAmountCents ?? 0,
      currency: pricing.currency,
      nominationCount: pricing.nominationCount,
      billableCount: pricing.billableCount,
      isIbpaMember: pricing.isIbpaMember,
      promoCodeKey: appliedPromo?.key ?? null,
      promoCodeKeyword: appliedPromo?.keyword ?? null,
      promoDiscountPercent: appliedPromo?.discountPercent ?? null,
    },
  };

  const payment = await prisma.payment.create({
    data: {
      source: "COMPETITOR",
      applicantProfileId: profile.id,
      applicantEmail: profile.account.email,
      provider: "stripe",
      purchaseManifest: manifest as unknown as Prisma.InputJsonValue,
      amount: finalAmountCents,
      currency: pricing.currency,
      promoCodeKey: appliedPromo?.key,
      promoCodeKeyword: appliedPromo?.keyword,
      promoDiscountPercent: appliedPromo?.discountPercent,
      promoDiscountAmount: appliedPromo?.discountAmountCents,
      status: "PENDING",
    },
    select: { id: true },
  });

  const checkoutSession = await createApplicantNominationCheckoutSession({
    paymentId: payment.id,
    email: profile.account.email,
    originalAmountCents: pricing.amountCents,
    finalAmountCents,
    currency: pricing.currency,
    nominationCount: selectedAwards.length,
    promoDiscountId,
  });

  await prisma.payment.update({
    where: { id: payment.id },
    data: { stripeSessionId: checkoutSession.id },
  });

  return {
    paymentId: payment.id,
    checkoutUrl: checkoutSession.url,
    amount: finalAmountCents,
    currency: pricing.currency,
  };
}

export function parseApplicantPurchaseManifest(value: Prisma.JsonValue | null): ApplicantPurchaseManifest | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const manifest = value as Partial<ApplicantPurchaseManifest>;
  if (
    manifest.version !== APPLICANT_PURCHASE_MANIFEST_VERSION ||
    manifest.flowType !== APPLICANT_NOMINATION_PURCHASE_FLOW ||
    !manifest.personalInfo?.email ||
    !Array.isArray(manifest.selectedAwards) ||
    !manifest.pricing
  ) {
    return null;
  }

  return manifest as ApplicantPurchaseManifest;
}

export async function getApplicantPurchaseSuccessSummary(sessionId: string | undefined) {
  if (!sessionId) return null;

  const payment = await prisma.payment.findUnique({
    where: { stripeSessionId: sessionId },
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      fulfilledAt: true,
      stripePaymentIntentId: true,
      purchaseManifest: true,
      purchasedNominations: {
        select: {
          id: true,
          category: { select: { name: true } },
          award: { select: { name: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      applicantProfile: {
        select: {
          account: { select: { status: true, passwordHash: true } },
        },
      },
    },
  });

  if (!payment) return null;
  const manifest = parseApplicantPurchaseManifest(payment.purchaseManifest);

  return {
    paymentId: payment.id,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    fulfilled: Boolean(payment.fulfilledAt),
    paymentReference: payment.stripePaymentIntentId
      ? `...${payment.stripePaymentIntentId.slice(-8)}`
      : `...${sessionId.slice(-8)}`,
    registrationComplete: Boolean(payment.applicantProfile?.account.passwordHash) &&
      payment.applicantProfile?.account.status === "ACTIVE",
    nominations:
      payment.purchasedNominations.length > 0
        ? payment.purchasedNominations.map((nomination) => ({
            id: nomination.id,
            categoryName: nomination.category.name,
            awardName: nomination.award.name,
          }))
        : manifest?.selectedAwards.map((award) => ({
            id: award.awardId,
            categoryName: award.categoryName,
            awardName: award.awardName,
          })) ?? [],
  };
}

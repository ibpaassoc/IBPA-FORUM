export const APPLICANT_MEMBER_PRICES_CENTS = [0, 5000, 10000, 13000, 18000, 20000] as const;
export const APPLICANT_NON_MEMBER_PRICES_CENTS = [0, 7000, 14000, 19000, 26000, 30000] as const;

export type ApplicantPricingInput = {
  nominationCount: number;
  isIbpaMember: boolean;
};

export type ApplicantPricingResult = {
  nominationCount: number;
  billableCount: number;
  isIbpaMember: boolean;
  amountCents: number;
  currency: "usd";
  unitLabel: string;
};

export function computeApplicantNominationPrice({
  nominationCount,
  isIbpaMember,
}: ApplicantPricingInput): ApplicantPricingResult {
  const safeCount = Math.max(1, Math.floor(nominationCount));
  const billableCount = Math.min(safeCount, 5) as 1 | 2 | 3 | 4 | 5;
  const prices = isIbpaMember ? APPLICANT_MEMBER_PRICES_CENTS : APPLICANT_NON_MEMBER_PRICES_CENTS;

  return {
    nominationCount: safeCount,
    billableCount,
    isIbpaMember,
    amountCents: prices[billableCount],
    currency: "usd",
    unitLabel:
      safeCount >= 5
        ? "5+ nomination package"
        : safeCount === 1
          ? "1 nomination"
          : `${safeCount} nominations`,
  };
}

export function allocateApplicantNominationAmounts(totalAmountCents: number, nominationCount: number) {
  const safeCount = Math.max(1, Math.floor(nominationCount));
  const baseAmount = Math.floor(totalAmountCents / safeCount);
  const remainder = totalAmountCents - baseAmount * safeCount;

  return Array.from({ length: safeCount }, (_, index) =>
    index === 0 ? baseAmount + remainder : baseAmount
  );
}

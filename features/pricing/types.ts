export type StripeAmount = {
  amountCents: number;
  currency: string;
};

type NullableAmount = StripeAmount | null;

export type StripePricingSnapshot = {
  forumTickets: {
    standard: { oneDay: NullableAmount; twoDays: NullableAmount };
    ibpaMembers: { oneDay: NullableAmount; twoDays: NullableAmount };
    galaDinner: NullableAmount;
    specialPacket: { ibpaMembers: NullableAmount; standard: NullableAmount };
  };
  awardParticipation: {
    ibpaMembers: { oneNomination: NullableAmount; threeNominations: NullableAmount; fiveNominations: NullableAmount };
    nonMembers: { oneNomination: NullableAmount; threeNominations: NullableAmount; fiveNominations: NullableAmount };
  };
  judgeRegistration: { ibpaMembers: NullableAmount; standard: NullableAmount };
};

// Prices are always shown with the "$100" symbol form, in every language: the
// ru/uk locales render USD as a trailing "100 USD" code, which the design and
// the discount strikethroughs are not built for.
export function formatStripeAmount(amount: StripeAmount | null) {
  if (!amount) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: amount.currency.toUpperCase(),
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: amount.amountCents % 100 === 0 ? 0 : 2,
  }).format(amount.amountCents / 100);
}

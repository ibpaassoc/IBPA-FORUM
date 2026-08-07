import type { Language } from "@/lib/i18n/translations";

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

export function formatStripeAmount(amount: StripeAmount | null, language: Language) {
  if (!amount) return "—";
  return new Intl.NumberFormat(language === "en" ? "en-US" : language === "ru" ? "ru-RU" : "uk-UA", {
    style: "currency",
    currency: amount.currency.toUpperCase(),
    maximumFractionDigits: amount.amountCents % 100 === 0 ? 0 : 2,
  }).format(amount.amountCents / 100);
}

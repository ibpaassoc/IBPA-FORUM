export type EarlyBirdDiscount =
  | { type: "percent"; value: number }
  | { type: "amount"; value: number; currency: string }
  | null;

export type EarlyBirdStatus = {
  enabled: boolean;
  discount: EarlyBirdDiscount;
};

export function applyDiscountToPrice(priceStr: string, discount: EarlyBirdDiscount): string | null {
  if (!discount) return null;
  const dollars = parseInt(priceStr.replace("$", ""), 10);
  let discounted: number;
  if (discount.type === "percent") {
    discounted = Math.round(dollars * (1 - discount.value / 100) * 100) / 100;
  } else {
    discounted = dollars - discount.value / 100;
  }
  return `$${discounted % 1 === 0 ? discounted.toFixed(0) : discounted.toFixed(2)}`;
}

export function applyDiscountToCents(amountCents: number, discount: EarlyBirdDiscount): number {
  if (!discount) return amountCents;
  if (discount.type === "percent") {
    return Math.round(amountCents * (1 - discount.value / 100));
  } else {
    return Math.max(0, amountCents - discount.value);
  }
}

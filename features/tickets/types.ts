export type TicketDiscount =
  | { type: "percent"; value: number }
  | { type: "amount"; value: number; currency: string }
  | null;

export type TicketDiscountKind = "earlyBird" | "permanent30";

export type TicketDiscountStatus = {
  enabled: boolean;
  kind: TicketDiscountKind | null;
  discount: TicketDiscount;
};

// Kept for the legacy Early Bird endpoint and older non-interactive sections.
export type EarlyBirdDiscount = TicketDiscount;
export type EarlyBirdStatus = {
  enabled: boolean;
  discount: TicketDiscount;
};

export function applyDiscountToPrice(priceStr: string, discount: TicketDiscount): string | null {
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

export function applyDiscountToCents(amountCents: number, discount: TicketDiscount): number {
  if (!discount) return amountCents;
  if (discount.type === "percent") {
    return Math.round(amountCents * (1 - discount.value / 100));
  } else {
    return Math.max(0, amountCents - discount.value);
  }
}

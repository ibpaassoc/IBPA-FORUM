import { NextResponse } from "next/server";
import { z } from "zod";
import {
  PromoCodeError,
  validatePromoCodeForFlow,
} from "@/features/promos/server/promo-service";
import {
  computeTicketAmountCents,
  type TicketAmountBreakdown,
} from "@/features/tickets/lib/pricing";
import { getActiveTicketDiscount } from "@/features/tickets/server/ticket-discount";
import { getTicketPriceConfigFromStripe } from "@/features/pricing/server/stripe-pricing";

const schema = z.discriminatedUnion("paymentFlow", [
  z.object({
    promoCode: z.string().optional(),
    paymentFlow: z.literal("APPLICATIONS"),
    amountCents: z.number().int().nonnegative(),
  }),
  z.object({
    promoCode: z.string().optional(),
    paymentFlow: z.literal("TICKETS"),
    ticketType: z.enum(["ONE_DAY", "TWO_DAYS"]),
    isIbpaMember: z.boolean(),
    galaDinner: z.boolean(),
  }),
]);

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, errorCode: "INVALID", message: "Invalid promo code." },
      { status: 400 }
    );
  }

  try {
    let ticketAmounts: TicketAmountBreakdown | null = null;
    let eligibleAmountCents: number;

    if (parsed.data.paymentFlow === "TICKETS") {
      const [activeTicketDiscount, pricing] = await Promise.all([
        getActiveTicketDiscount(),
        getTicketPriceConfigFromStripe(),
      ]);
      ticketAmounts = computeTicketAmountCents({
        type: parsed.data.ticketType,
        isIbpaMember: parsed.data.isIbpaMember,
        galaDinner: parsed.data.galaDinner,
        ticketDiscount:
          activeTicketDiscount?.kind === "permanent30"
            ? activeTicketDiscount.discount
            : null,
        pricing,
      });
      eligibleAmountCents = ticketAmounts.ticketCents;
    } else {
      eligibleAmountCents = parsed.data.amountCents;
    }

    const promo = await validatePromoCodeForFlow({
      keyword: parsed.data.promoCode,
      paymentFlow: parsed.data.paymentFlow,
      amountCents: eligibleAmountCents,
    });

    if (!promo) {
      return NextResponse.json(
        { ok: false, errorCode: "EMPTY", message: "Promo code is required." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      promo: {
        keyword: promo.keyword,
        discountPercent: promo.discountPercent,
        originalAmountCents: promo.originalAmountCents,
        discountAmountCents: promo.discountAmountCents,
        discountedAmountCents: promo.finalAmountCents,
        galaDinnerAmountCents: ticketAmounts?.galaCents ?? 0,
        finalAmountCents: promo.finalAmountCents + (ticketAmounts?.galaCents ?? 0),
      },
    });
  } catch (error) {
    if (error instanceof PromoCodeError) {
      return NextResponse.json(
        { ok: false, errorCode: error.code, message: error.message },
        { status: error.code === "DISABLED" ? 409 : 400 }
      );
    }

    console.error("POST /api/promo-codes/validate error:", error);
    return NextResponse.json(
      { ok: false, errorCode: "INVALID", message: "Invalid promo code." },
      { status: 500 }
    );
  }
}

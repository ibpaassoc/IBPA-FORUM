import { NextResponse } from "next/server";
import { z } from "zod";
import {
  PromoCodeError,
  validatePromoCodeForFlow,
} from "@/features/promos/server/promo-service";

const schema = z.object({
  promoCode: z.string().optional(),
  paymentFlow: z.enum(["APPLICATIONS", "TICKETS"]),
  amountCents: z.number().int().nonnegative(),
});

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
    const promo = await validatePromoCodeForFlow({
      keyword: parsed.data.promoCode,
      paymentFlow: parsed.data.paymentFlow,
      amountCents: parsed.data.amountCents,
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
        finalAmountCents: promo.finalAmountCents,
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

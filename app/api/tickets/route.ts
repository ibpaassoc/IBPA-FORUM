import { NextRequest, NextResponse } from "next/server";
import { ticketApiSchema } from "@/features/tickets/schemas/ticket-form-schema";
import { initiateTicketPurchase, InvalidCertError } from "@/features/tickets/server/ticket-service";
import { isProduction, validateProductionEnv } from "@/lib/env";
import { getServerLanguage } from "@/lib/i18n/server";
import { PromoCodeError } from "@/features/promos/server/promo-service";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Unknown server error.";
}

export async function POST(request: NextRequest) {
  console.info("POST /api/tickets called");

  const locale = await getServerLanguage();

  try {
    validateProductionEnv([
      { names: ["DATABASE_URL"] },
      { names: ["STRIPE_SECRET_KEY"], ascii: true },
      { names: ["APP_URL", "FRONTEND_URL", "NEXT_PUBLIC_APP_URL"] },
    ]);

    const body = await request.json();
    const parsed = ticketApiSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please review the form and correct the highlighted fields." },
        { status: 400 }
      );
    }

    const result = await initiateTicketPurchase({ ...parsed.data, locale });

    return NextResponse.json({ checkoutUrl: result.checkoutUrl }, { status: 201 });
  } catch (error) {
    if (error instanceof InvalidCertError) {
      return NextResponse.json({ message: error.message }, { status: 422 });
    }

    if (error instanceof PromoCodeError) {
      return NextResponse.json(
        { errorCode: `PROMO_${error.code}`, message: error.message },
        { status: error.code === "DISABLED" ? 409 : 400 }
      );
    }

    console.error("POST /api/tickets error:", error);

    const devMessage = `Failed to create ticket: ${getErrorMessage(error)}`;

    return NextResponse.json(
      {
        message: isProduction()
          ? "Something went wrong. Please try again in a moment."
          : devMessage,
      },
      { status: 500 }
    );
  }
}

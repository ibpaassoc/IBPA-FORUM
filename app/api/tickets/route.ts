import { NextRequest, NextResponse } from "next/server";
import { ticketApiSchema } from "@/features/tickets/schemas/ticket-form-schema";
import { initiateTicketPurchase, TicketConflictError, InvalidCertError } from "@/features/tickets/server/ticket-service";
import { EnvConfigError, isProduction, validateProductionEnv } from "@/lib/env";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Unknown server error.";
}

export async function POST(request: NextRequest) {
  console.info("POST /api/tickets called");

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

    const result = await initiateTicketPurchase(parsed.data);

    return NextResponse.json({ checkoutUrl: result.checkoutUrl }, { status: 201 });
  } catch (error) {
    if (error instanceof TicketConflictError) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    if (error instanceof InvalidCertError) {
      return NextResponse.json({ message: error.message }, { status: 422 });
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

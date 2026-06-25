import { NextRequest, NextResponse } from "next/server";

import { contactFormSchema } from "@/features/contact/schemas/contact-form-schema";
import { submitContactMessage } from "@/features/contact/server/contact-service";
import { isProduction } from "@/lib/env";

export const dynamic = "force-dynamic";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Unknown server error.";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = contactFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { message: "Please review the form and correct the highlighted fields." },
        { status: 400 }
      );
    }

    // Honeypot tripped — pretend success so bots get no signal.
    if (parsed.data.company) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const result = await submitContactMessage(parsed.data);

    if (!result.delivered) {
      console.error("Contact message was not delivered.", {
        reason: result.reason,
        error: result.error,
      });

      return NextResponse.json(
        {
          message:
            "We couldn't send your message right now. Please email us directly.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/contact error:", error);

    const devMessage = `Failed to send contact message: ${getErrorMessage(error)}`;

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

import { NextResponse } from "next/server";
import { requireApplicantAccount } from "@/features/account/server/accounts";
import {
  ApplicantPurchaseError,
  createAccountApplicantNominationCheckout,
} from "@/features/applications/server/purchase-workflow";
import { activateRequestDataScope } from "@/features/test/server/data-scope";

export async function POST(request: Request) {
  const { account, applicantProfile } = await requireApplicantAccount();
  activateRequestDataScope({ dataScope: account.dataScope });
  const body = (await request.json().catch(() => ({}))) as {
    awardIds?: unknown;
    promoCode?: unknown;
  };
  const awardIds = Array.isArray(body.awardIds)
    ? body.awardIds.filter((item): item is string => typeof item === "string")
    : [];
  const promoCode = typeof body.promoCode === "string" ? body.promoCode : "";

  try {
    const result = await createAccountApplicantNominationCheckout({
      applicantProfileId: applicantProfile.id,
      awardIds,
      promoCode,
    });

    return NextResponse.json({
      message: "Redirecting to secure Stripe Checkout.",
      ...result,
    });
  } catch (error) {
    if (error instanceof ApplicantPurchaseError) {
      return NextResponse.json(
        {
          errorCode: error.code,
          message: error.message,
          fieldErrors: error.fieldErrors,
        },
        { status: error.status }
      );
    }

    console.error("POST /api/applicant/nominations/checkout error:", error);
    return NextResponse.json(
      { message: "Could not create nomination checkout." },
      { status: 500 }
    );
  }
}

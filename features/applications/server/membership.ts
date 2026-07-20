import type {
  MembershipLevel,
  MembershipValidationResult,
} from "@/features/applications/types/application.types";
import { verifyIbpaMembership } from "@/features/tickets/server/ibpa-membership";

const membershipOrder: MembershipLevel[] = [
  "Starter",
  "Artist",
  "Trainer",
  "Coach",
  "Educator",
  "Master",
  "Director",
];

function compareMembershipLevel(level: MembershipLevel, minimum: MembershipLevel) {
  return membershipOrder.indexOf(level) - membershipOrder.indexOf(minimum);
}

export async function validateMembershipNumber(
  membershipNumber: string
): Promise<MembershipValidationResult> {
  const trimmed = membershipNumber.trim();

  if (!trimmed) {
    return {
      membershipNumber: "",
      membershipLevel: null,
      qualified: false,
      message: "IBPA Membership Number is required.",
      source: "api",
    };
  }

  const verification = await verifyIbpaMembership(trimmed);

  if (verification.verified) {
    const membershipLevel: MembershipLevel = "Trainer";

    return {
      membershipNumber: trimmed,
      membershipLevel,
      qualified: compareMembershipLevel(membershipLevel, "Trainer") >= 0,
      message: null,
      source: "api",
    };
  }

  return {
    membershipNumber: trimmed,
    membershipLevel: null,
    qualified: false,
    message:
      verification.reason === "invalid_cert"
        ? "We could not verify that membership number. Please check the number and try again."
        : "Membership verification is temporarily unavailable. Standard pricing will be used.",
    source: "api",
  };
}

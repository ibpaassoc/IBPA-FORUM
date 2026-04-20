import type { MembershipLevel, MembershipValidationResult } from "@/lib/apply/types";

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

function stubLookupMembershipLevel(membershipNumber: string): MembershipLevel | null {
  const normalized = membershipNumber.toUpperCase();

  if (!normalized) {
    return null;
  }

  if (
    normalized.includes("DIRECTOR") ||
    normalized.includes("-DIR") ||
    normalized.startsWith("DIR-")
  ) {
    return "Director";
  }

  if (
    normalized.includes("MASTER") ||
    normalized.includes("-MAS") ||
    normalized.startsWith("MAS-")
  ) {
    return "Master";
  }

  if (
    normalized.includes("EDU") ||
    normalized.includes("EDUCATOR")
  ) {
    return "Educator";
  }

  if (
    normalized.includes("COACH") ||
    normalized.includes("-COA") ||
    normalized.startsWith("COA-")
  ) {
    return "Coach";
  }

  if (
    normalized.includes("TRAINER") ||
    normalized.includes("-TRN") ||
    normalized.startsWith("TRN-")
  ) {
    return "Trainer";
  }

  if (
    normalized.includes("STARTER") ||
    normalized.includes("STUDENT") ||
    normalized.includes("BASIC") ||
    normalized.includes("-STA")
  ) {
    return "Starter";
  }

  if (
    normalized.includes("ARTIST") ||
    normalized.includes("-ART") ||
    normalized.startsWith("ART-")
  ) {
    return "Artist";
  }

  if (/^IBPA-\d{4,}$/i.test(membershipNumber)) {
    return "Trainer";
  }

  return null;
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
      source: "stub",
    };
  }

  const apiUrl = process.env.IBPA_MEMBERSHIP_VALIDATION_URL;

  if (apiUrl) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ membershipNumber: trimmed }),
        cache: "no-store",
      });

      if (response.ok) {
        const payload = (await response.json()) as {
          membershipLevel?: MembershipLevel | null;
        };
        const membershipLevel = payload.membershipLevel ?? null;
        const qualified =
          membershipLevel !== null &&
          compareMembershipLevel(membershipLevel, "Trainer") >= 0;

        return {
          membershipNumber: trimmed,
          membershipLevel,
          qualified,
          message: qualified
            ? null
            : "Your current membership level does not qualify for Championship participation.\n\nUpgrade to Trainer / Coach or higher at ibpa-usa.org to apply.",
          source: "api",
        };
      }
    } catch (error) {
      console.error("Membership API validation failed, falling back to stub.", error);
    }
  }

  const membershipLevel = stubLookupMembershipLevel(trimmed);

  if (!membershipLevel) {
    return {
      membershipNumber: trimmed,
      membershipLevel: null,
      qualified: false,
      message:
        "We could not verify that membership number. Please check the number and try again.",
      source: "stub",
    };
  }

  const qualified = compareMembershipLevel(membershipLevel, "Trainer") >= 0;

  return {
    membershipNumber: trimmed,
    membershipLevel,
    qualified,
    message: qualified
      ? null
      : "Your current membership level does not qualify for Championship participation.\n\nUpgrade to Trainer / Coach or higher at ibpa-usa.org to apply.",
    source: "stub",
  };
}

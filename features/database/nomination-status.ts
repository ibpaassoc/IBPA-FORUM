import type { NominationStatus } from "@prisma/client";

const ALLOWED_TRANSITIONS: Readonly<Record<NominationStatus, readonly NominationStatus[]>> = {
  DRAFT: ["SUBMITTED", "LOCKED", "ARCHIVED"],
  SUBMITTED: ["RETURNED_FOR_CHANGES", "UNDER_REVIEW", "LOCKED", "WITHDRAWN", "REJECTED"],
  RETURNED_FOR_CHANGES: ["SUBMITTED", "LOCKED", "ARCHIVED"],
  UNDER_REVIEW: ["RETURNED_FOR_CHANGES", "SCORED", "LOCKED"],
  SCORED: ["UNDER_REVIEW", "LOCKED", "ARCHIVED"],
  WITHDRAWN: ["ARCHIVED"],
  REJECTED: ["ARCHIVED"],
  LOCKED: ["UNDER_REVIEW", "ARCHIVED"],
  ARCHIVED: [],
};

export function canTransitionNominationStatus(from: NominationStatus, to: NominationStatus) {
  return from === to || ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertNominationStatusTransition(from: NominationStatus, to: NominationStatus) {
  if (!canTransitionNominationStatus(from, to)) {
    throw new Error(`Invalid nomination status transition: ${from} -> ${to}`);
  }
}

export function editableNominationStatus(status: NominationStatus) {
  // Applicants can revise a submitted nomination until staff advances or
  // explicitly locks it. This preserves the pre-refactor workflow and matches
  // the editor's "Update submission" action.
  return status === "DRAFT" || status === "SUBMITTED" || status === "RETURNED_FOR_CHANGES";
}

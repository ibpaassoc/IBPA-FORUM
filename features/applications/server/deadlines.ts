import "server-only";

import { resolveApplicantSubmissionAccess } from "@/features/applications/lib/deadline-access";
import { getSiteSetting, setSiteSetting } from "@/features/settings/server/site-settings";

export const APPLICANT_SUBMISSION_DEADLINE_KEY = "applicant_submission_deadline";
export const APPLICANT_APPLICATIONS_CLOSED_AT_KEY = "applicant_applications_closed_at";
export const DEFAULT_APPLICANT_SUBMISSION_DEADLINE = "2026-08-05T23:59:59.000-07:00";

export async function getApplicantSubmissionDeadline() {
  const value = await getSiteSetting(APPLICANT_SUBMISSION_DEADLINE_KEY);
  const parsed = new Date(value ?? DEFAULT_APPLICANT_SUBMISSION_DEADLINE);
  return Number.isNaN(parsed.getTime())
    ? new Date(DEFAULT_APPLICANT_SUBMISSION_DEADLINE)
    : parsed;
}

export async function getApplicantApplicationsClosedAt() {
  const value = await getSiteSetting(APPLICANT_APPLICATIONS_CLOSED_AT_KEY);
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function getApplicantSubmissionAccess(
  deadlineOverrideAt: Date | null,
  now = new Date(),
) {
  const [globalDeadline, globalClosedAt] = await Promise.all([
    getApplicantSubmissionDeadline(),
    getApplicantApplicationsClosedAt(),
  ]);

  return {
    ...resolveApplicantSubmissionAccess({
      now,
      globalDeadline,
      globalClosedAt,
      deadlineOverrideAt,
    }),
    globalDeadline,
    globalClosedAt,
  };
}

export async function setApplicantSubmissionDeadline(deadline: Date) {
  await setSiteSetting(APPLICANT_SUBMISSION_DEADLINE_KEY, deadline.toISOString());
}

export async function markApplicantApplicationsClosed(closedAt = new Date()) {
  await setSiteSetting(APPLICANT_APPLICATIONS_CLOSED_AT_KEY, closedAt.toISOString());
  return closedAt;
}

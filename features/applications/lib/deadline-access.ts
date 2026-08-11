export type ApplicantSubmissionAccessInput = {
  now: Date;
  globalDeadline: Date;
  globalClosedAt: Date | null;
  deadlineOverrideAt: Date | null;
};

export function resolveApplicantSubmissionAccess({
  now,
  globalDeadline,
  globalClosedAt,
  deadlineOverrideAt,
}: ApplicantSubmissionAccessInput) {
  const deadline = deadlineOverrideAt ?? globalDeadline;
  const isOpen =
    deadline > now &&
    (deadlineOverrideAt !== null || globalClosedAt === null);

  return {
    deadline,
    isOpen,
    isClosed: !isOpen,
  };
}

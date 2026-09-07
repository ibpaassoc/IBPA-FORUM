export type StoredJuryReviewStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "COMPLETED"
  | "LOCKED";

export type OfficialScoreCandidate = {
  status: string;
  totalScore: { toString(): string } | number | null;
};

/** Only an explicitly submitted review is official. Draft and legacy states never count. */
export function isSubmittedReviewStatus(status: string) {
  return status === "SUBMITTED";
}

export function isDraftReviewStatus(status: string) {
  return status !== "NOT_STARTED" && !isSubmittedReviewStatus(status);
}

export function getSubmittedReviewCount(reviews: Array<{ status: string }>) {
  return reviews.filter((review) => isSubmittedReviewStatus(review.status)).length;
}

export function getAverageOfficialScore(reviews: OfficialScoreCandidate[]) {
  const submitted = reviews.filter(
    (review) => isSubmittedReviewStatus(review.status) && review.totalScore !== null,
  );

  if (submitted.length === 0) return null;

  return (
    submitted.reduce((sum, review) => sum + Number(review.totalScore), 0) /
    submitted.length
  );
}

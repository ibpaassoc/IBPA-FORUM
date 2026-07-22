import { z } from "zod";

const integerScore = z
  .number()
  .int("Scores must be whole numbers.")
  .min(0, "Scores must be at least 0.")
  .max(100, "Scores cannot be greater than 100.");

const nullableComment = z
  .string()
  .trim()
  .max(5000, "Comments must be 5000 characters or less.")
  .nullable()
  .transform((value) => (value && value.length > 0 ? value : null));

export const draftReviewSchema = z.object({
  scores: z.record(z.string().min(1), integerScore.nullable()),
  comment: nullableComment.optional().default(null),
});

export const submitReviewSchema = z.object({
  scores: z.record(z.string().min(1), integerScore),
  comment: nullableComment.optional().default(null),
});

export type DraftReviewInput = z.infer<typeof draftReviewSchema>;
export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;

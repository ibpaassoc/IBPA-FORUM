import { z } from "zod";

const integerScore = z
  .number()
  .int("Scores must be whole numbers.")
  .min(0, "Scores must be at least 0.")
  .max(10, "Scores cannot be greater than 10.");

const nullableComment = z
  .string()
  .trim()
  .max(5000, "Comments must be 5000 characters or less.")
  .nullable()
  .transform((value) => (value && value.length > 0 ? value : null));

export const draftScoreSchema = z.object({
  technical: integerScore.nullable().optional(),
  aesthetic: integerScore.nullable().optional(),
  creativity: integerScore.nullable().optional(),
  impact: integerScore.nullable().optional(),
  presentation: integerScore.nullable().optional(),
  comment: nullableComment.optional().default(null),
});

export const submitScoreSchema = z.object({
  technical: integerScore,
  aesthetic: integerScore,
  creativity: integerScore,
  impact: integerScore,
  presentation: integerScore,
  comment: nullableComment.optional().default(null),
});

export type DraftScoreInput = z.infer<typeof draftScoreSchema>;
export type SubmitScoreInput = z.infer<typeof submitScoreSchema>;

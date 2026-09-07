-- Add an explicit final state while retaining legacy enum values for rollback
-- compatibility. Only rows with a real submission timestamp are backfilled.
ALTER TYPE "forum_next"."JuryReviewStatus" ADD VALUE IF NOT EXISTS 'SUBMITTED' BEFORE 'COMPLETED';

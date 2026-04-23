ALTER TYPE "JuryApplicationStatus" RENAME TO "JuryApplicationStatus_old";

CREATE TYPE "JuryApplicationStatus" AS ENUM ('SUBMITTED', 'APPROVED', 'REJECTED', 'PAID');

ALTER TABLE "JuryApplication"
ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "JuryApplication"
ALTER COLUMN "status" TYPE "JuryApplicationStatus"
USING (
    CASE "status"::text
        WHEN 'PENDING_REVIEW' THEN 'SUBMITTED'::"JuryApplicationStatus"
        WHEN 'UNDER_REVIEW' THEN 'SUBMITTED'::"JuryApplicationStatus"
        WHEN 'APPROVED' THEN 'APPROVED'::"JuryApplicationStatus"
        WHEN 'REJECTED' THEN 'REJECTED'::"JuryApplicationStatus"
        WHEN 'ACTIVE_JUDGE' THEN 'PAID'::"JuryApplicationStatus"
        ELSE 'SUBMITTED'::"JuryApplicationStatus"
    END
);

ALTER TABLE "JuryApplication"
ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';

DROP TYPE "JuryApplicationStatus_old";

ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";

CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

ALTER TABLE "Application"
ALTER COLUMN "paymentStatus" DROP DEFAULT;

ALTER TABLE "Application"
ALTER COLUMN "paymentStatus" TYPE "PaymentStatus"
USING (
    CASE "paymentStatus"::text
        WHEN 'PAID' THEN 'PAID'::"PaymentStatus"
        WHEN 'FAILED' THEN 'FAILED'::"PaymentStatus"
        ELSE 'PENDING'::"PaymentStatus"
    END
);

ALTER TABLE "Application"
ALTER COLUMN "paymentStatus" SET DEFAULT 'PENDING';

ALTER TABLE "Payment"
ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Payment"
ALTER COLUMN "status" TYPE "PaymentStatus"
USING (
    CASE "status"::text
        WHEN 'PAID' THEN 'PAID'::"PaymentStatus"
        WHEN 'FAILED' THEN 'FAILED'::"PaymentStatus"
        ELSE 'PENDING'::"PaymentStatus"
    END
);

ALTER TABLE "Payment"
ALTER COLUMN "status" SET DEFAULT 'PENDING';

ALTER TABLE "JuryApplication"
ALTER COLUMN "paymentStatus" DROP DEFAULT;

ALTER TABLE "JuryApplication"
ALTER COLUMN "paymentStatus" TYPE "PaymentStatus"
USING (
    CASE "paymentStatus"::text
        WHEN 'PAID' THEN 'PAID'::"PaymentStatus"
        WHEN 'FAILED' THEN 'FAILED'::"PaymentStatus"
        ELSE 'PENDING'::"PaymentStatus"
    END
);

ALTER TABLE "JuryApplication"
ALTER COLUMN "paymentStatus" SET DEFAULT 'PENDING';

DROP TYPE "PaymentStatus_old";

DROP INDEX IF EXISTS "JuryApplication_stripePaymentIntentId_key";

ALTER TABLE "JuryApplication"
DROP COLUMN "reviewedAt",
DROP COLUMN "stripePaymentIntentId",
DROP COLUMN "registrationTokenHash",
DROP COLUMN "registrationTokenExpiresAt",
DROP COLUMN "registrationEmailSentAt";

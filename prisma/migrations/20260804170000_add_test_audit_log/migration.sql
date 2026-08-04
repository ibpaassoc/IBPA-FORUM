CREATE TABLE "TestAuditLog" (
  "id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "targetId" TEXT,
  "summary" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TestAuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TestAuditLog_createdAt_idx" ON "TestAuditLog"("createdAt");
CREATE INDEX "TestAuditLog_action_targetType_idx" ON "TestAuditLog"("action", "targetType");

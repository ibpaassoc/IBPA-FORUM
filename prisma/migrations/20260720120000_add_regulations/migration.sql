-- A single nullable category relation allows one general record and one
-- language-aware record per category. The stable key enforces the singleton
-- general row while keeping the migration backward compatible.
CREATE TABLE "Regulation" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "categoryId" TEXT,
    "enUrl" TEXT,
    "ruUrl" TEXT,
    "uaUrl" TEXT,
    "technicalRequirements" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Regulation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Regulation_key_key" ON "Regulation"("key");
CREATE UNIQUE INDEX "Regulation_categoryId_key" ON "Regulation"("categoryId");

ALTER TABLE "Regulation"
ADD CONSTRAINT "Regulation_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

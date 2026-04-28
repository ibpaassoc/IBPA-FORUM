CREATE TABLE "JuryAccount" (
    "id" TEXT NOT NULL,
    "juryApplicationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JuryAccount_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "JuryAccount_juryApplicationId_key" ON "JuryAccount"("juryApplicationId");
CREATE UNIQUE INDEX "JuryAccount_email_key" ON "JuryAccount"("email");

ALTER TABLE "JuryAccount"
ADD CONSTRAINT "JuryAccount_juryApplicationId_fkey"
FOREIGN KEY ("juryApplicationId") REFERENCES "JuryApplication"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

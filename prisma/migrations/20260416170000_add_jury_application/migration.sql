-- CreateTable
CREATE TABLE "JuryApplication" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "professionalTitle" TEXT NOT NULL,
    "yearsExperience" INTEGER NOT NULL,
    "employerAffiliation" TEXT NOT NULL,
    "membershipStatus" TEXT NOT NULL,
    "membershipLevel" TEXT,
    "previousJudgingExperience" BOOLEAN NOT NULL,
    "previousJudgingDetails" TEXT,
    "pastWinner" BOOLEAN NOT NULL DEFAULT false,
    "pastWinnerYear" INTEGER,
    "expertiseAreas" TEXT[],
    "professionalBio" TEXT NOT NULL,
    "professionalWebsite" TEXT,
    "conflictDisclosure" TEXT NOT NULL,
    "confidentialityAgreementAccepted" BOOLEAN NOT NULL DEFAULT false,
    "motivation" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JuryApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JuryApplicationFile" (
    "id" TEXT NOT NULL,
    "juryApplicationId" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "storageKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JuryApplicationFile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JuryApplicationFile" ADD CONSTRAINT "JuryApplicationFile_juryApplicationId_fkey" FOREIGN KEY ("juryApplicationId") REFERENCES "JuryApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

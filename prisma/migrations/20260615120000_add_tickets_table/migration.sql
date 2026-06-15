CREATE TYPE "TicketType" AS ENUM ('ONE_DAY', 'TWO_DAYS');

CREATE TYPE "TicketStatus" AS ENUM ('PENDING', 'PAID', 'CANCELED', 'CHECKED_ONE_DAY', 'CHECKED_TWO_DAY', 'CHECKED_GALA_DINNER');

CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "secureToken" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "type" "TicketType" NOT NULL,
    "galaDinner" BOOLEAN NOT NULL DEFAULT false,
    "isIbpaMember" BOOLEAN NOT NULL DEFAULT false,
    "ibpaCertNumber" TEXT,
    "paymentLink" TEXT,
    "stripeSessionId" TEXT,
    "status" "TicketStatus" NOT NULL DEFAULT 'PENDING',
    "lastCheckIn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Ticket_secureToken_key" ON "Ticket"("secureToken");
CREATE UNIQUE INDEX "Ticket_stripeSessionId_key" ON "Ticket"("stripeSessionId");

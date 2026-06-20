-- Pre-launch waitlist
-- CreateTable
CREATE TABLE "WaitlistEntry" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "refCode" TEXT NOT NULL,
    "referredBy" TEXT,
    "referrals" INTEGER NOT NULL DEFAULT 0,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WaitlistEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistEntry_email_key" ON "WaitlistEntry"("email");

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistEntry_refCode_key" ON "WaitlistEntry"("refCode");

-- CreateIndex
CREATE INDEX "WaitlistEntry_referredBy_idx" ON "WaitlistEntry"("referredBy");

-- CreateIndex
CREATE INDEX "WaitlistEntry_referrals_createdAt_idx" ON "WaitlistEntry"("referrals", "createdAt");

-- AlterTable: add phone verification fields to User
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
ALTER TABLE "User" ADD COLUMN "phoneVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "otpCode" TEXT;
ALTER TABLE "User" ADD COLUMN "otpExpiresAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "otpAttempts" INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateTable: DietPlan
CREATE TABLE "DietPlan" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "targetCalories" INTEGER,
    "tdee" INTEGER,
    "goal" TEXT,
    "dietType" TEXT,
    "meals" JSONB NOT NULL,
    "totals" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DietPlan_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DietPlan_userId_idx" ON "DietPlan"("userId");

ALTER TABLE "DietPlan" ADD CONSTRAINT "DietPlan_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: ProgressLog
CREATE TABLE "ProgressLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weight" DOUBLE PRECISION,
    "caloriesConsumed" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgressLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProgressLog_userId_idx" ON "ProgressLog"("userId");

ALTER TABLE "ProgressLog" ADD CONSTRAINT "ProgressLog_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

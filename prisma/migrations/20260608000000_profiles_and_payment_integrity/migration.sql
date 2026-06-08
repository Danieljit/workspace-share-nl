-- CreateEnum
CREATE TYPE "ProfileVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('GUEST', 'HOST', 'BOTH');

-- AlterTable: professional profile layer on User (all additive / safe)
ALTER TABLE "User"
    ADD COLUMN "headline" TEXT,
    ADD COLUMN "bio" TEXT,
    ADD COLUMN "jobTitle" TEXT,
    ADD COLUMN "companyName" TEXT,
    ADD COLUMN "industry" TEXT,
    ADD COLUMN "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN "lookingFor" TEXT,
    ADD COLUMN "websiteUrl" TEXT,
    ADD COLUMN "linkedinUrl" TEXT,
    ADD COLUMN "city" TEXT,
    ADD COLUMN "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
    ADD COLUMN "preferredWorkdays" TEXT[] DEFAULT ARRAY[]::TEXT[],
    -- profileVisibility / userType below are NOT NULL with a default so existing rows backfill safely
    ADD COLUMN "profileVisibility" "ProfileVisibility" NOT NULL DEFAULT 'PRIVATE',
    ADD COLUMN "userType" "UserType" NOT NULL DEFAULT 'GUEST';

-- AlterTable: payment-integrity fields on Booking
ALTER TABLE "Booking"
    ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN "stripePaymentIntentId" TEXT,
    ADD COLUMN "paymentStatus" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Booking_stripePaymentIntentId_key" ON "Booking"("stripePaymentIntentId");

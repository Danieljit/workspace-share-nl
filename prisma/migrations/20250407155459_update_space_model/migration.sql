/*
  Warnings:

  - You are about to drop the column `capacity` on the `Space` table. All the data in the column will be lost.
  - You are about to drop the column `features` on the `Space` table. All the data in the column will be lost.
  - You are about to drop the column `floorPlan` on the `Space` table. All the data in the column will be lost.
  - You are about to drop the column `images` on the `Space` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Space` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Space` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Space` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Space` table. All the data in the column will be lost.
  - The `amenities` column on the `Space` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `availability` column on the `Space` table would be dropped and recreated. This will lead to data loss if there is data in the column.
*/

-- First, add the new columns as nullable
ALTER TABLE "Space" 
ADD COLUMN "title" TEXT,
ADD COLUMN "workspaceType" "SpaceType",
ADD COLUMN "address" TEXT,
ADD COLUMN "city" TEXT,
ADD COLUMN "postalCode" TEXT,
ADD COLUMN "country" TEXT DEFAULT 'Netherlands',
ADD COLUMN "unitNumber" TEXT,
ADD COLUMN "coordinates" JSONB,
ADD COLUMN "directions" TEXT,
ADD COLUMN "transportInfo" TEXT,
ADD COLUMN "parkingInfo" TEXT,
ADD COLUMN "buildingContext" JSONB,
ADD COLUMN "workspaceDetails" JSONB,
ADD COLUMN "photos" JSONB,
ADD COLUMN "pricePerDay" DOUBLE PRECISION,
ADD COLUMN "pricePerThreeDays" DOUBLE PRECISION,
ADD COLUMN "pricePerWeek" DOUBLE PRECISION,
ADD COLUMN "pricePerMonth" DOUBLE PRECISION,
ADD COLUMN "hostName" TEXT,
ADD COLUMN "hostEmail" TEXT,
ADD COLUMN "hostPhone" TEXT,
ADD COLUMN "preferredContact" TEXT,
ADD COLUMN "responseTime" TEXT,
ADD COLUMN "hostInfo" TEXT;

-- Migrate data from old columns to new columns
UPDATE "Space" SET 
  "title" = "name",
  "workspaceType" = "type",
  "address" = "location",
  "city" = 'Amsterdam', -- Default city
  "postalCode" = '1000 AA', -- Default postal code
  "pricePerDay" = "price",
  "hostName" = (SELECT "name" FROM "User" WHERE "User"."id" = "Space"."ownerId"),
  "photos" = CASE WHEN "images" IS NOT NULL THEN CAST("images" AS JSONB) ELSE NULL END,
  "amenities" = CASE WHEN "amenities" IS NOT NULL THEN CAST("amenities" AS JSONB) ELSE NULL END,
  "availability" = CASE WHEN "availability" IS NOT NULL THEN CAST("availability" AS JSONB) ELSE NULL END;

-- Set default host name if NULL
UPDATE "Space" SET "hostName" = 'Host' WHERE "hostName" IS NULL;

-- Now make the required columns non-nullable
ALTER TABLE "Space" 
ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "workspaceType" SET NOT NULL,
ALTER COLUMN "address" SET NOT NULL,
ALTER COLUMN "city" SET NOT NULL,
ALTER COLUMN "postalCode" SET NOT NULL,
ALTER COLUMN "pricePerDay" SET NOT NULL,
ALTER COLUMN "hostName" SET NOT NULL;

-- Finally drop the old columns
ALTER TABLE "Space" 
DROP COLUMN "capacity",
DROP COLUMN "features",
DROP COLUMN "floorPlan",
DROP COLUMN "images",
DROP COLUMN "location",
DROP COLUMN "name",
DROP COLUMN "price",
DROP COLUMN "type";

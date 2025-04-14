/*
  Warnings:

  - The `amenities` column on the `Space` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `availability` column on the `Space` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `country` on table `Space` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Space" DROP COLUMN "amenities",
ADD COLUMN     "amenities" JSONB,
DROP COLUMN "availability",
ADD COLUMN     "availability" JSONB,
ALTER COLUMN "country" SET NOT NULL;

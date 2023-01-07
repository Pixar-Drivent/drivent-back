/*
  Warnings:

  - Added the required column `date` to the `Activity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "date" VARCHAR(255) NOT NULL,
ALTER COLUMN "StartTime" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "EndTime" SET DATA TYPE VARCHAR(255);

-- CreateIndex
CREATE INDEX "index_date" ON "Activity"("date");

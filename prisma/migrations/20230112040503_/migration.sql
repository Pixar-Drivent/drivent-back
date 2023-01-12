/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Payment_Url` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Payment_Url_userId_key" ON "Payment_Url"("userId");

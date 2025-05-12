/*
  Warnings:

  - A unique constraint covering the columns `[reviewerId,eventId]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "reviews_reviewerId_eventId_key" ON "reviews"("reviewerId", "eventId");

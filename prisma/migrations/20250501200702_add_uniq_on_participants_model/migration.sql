/*
  Warnings:

  - A unique constraint covering the columns `[userId,eventId]` on the table `participants` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "participants_userId_eventId_key" ON "participants"("userId", "eventId");

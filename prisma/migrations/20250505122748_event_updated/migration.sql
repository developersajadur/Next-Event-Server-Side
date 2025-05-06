/*
  Warnings:

  - Added the required column `availableSit` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reseveredSit` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "events" ADD COLUMN     "availableSit" INTEGER NOT NULL,
ADD COLUMN     "reseveredSit" INTEGER NOT NULL;

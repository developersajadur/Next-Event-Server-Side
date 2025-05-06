/*
  Warnings:

  - You are about to drop the column `dateTime` on the `events` table. All the data in the column will be lost.
  - Added the required column `category` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `eventStatus` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `events` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('UPCOMING', 'ONGOING', 'ENDED');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('CONFERENCE', 'WORKSHOP', 'SEMINAR', 'NETWORKING', 'PARTY', 'CONCERT', 'EXHIBITION', 'OTHER');

-- AlterTable
ALTER TABLE "events" DROP COLUMN "dateTime",
ADD COLUMN     "category" "Category" NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "eventStatus" "EventStatus" NOT NULL,
ADD COLUMN     "inEventExist" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "address" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "occupation" TEXT;

/*
  Warnings:

  - You are about to drop the column `inviteeId` on the `invites` table. All the data in the column will be lost.
  - Made the column `fee` on table `events` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `inviteReceiverId` to the `invites` table without a default value. This is not possible if the table is not empty.
  - Added the required column `inviterId` to the `invites` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "invites" DROP CONSTRAINT "invites_inviteeId_fkey";

-- AlterTable
ALTER TABLE "events" ALTER COLUMN "fee" SET NOT NULL;

-- AlterTable
ALTER TABLE "invites" DROP COLUMN "inviteeId",
ADD COLUMN     "inviteReceiverId" TEXT NOT NULL,
ADD COLUMN     "inviterId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_inviteReceiverId_fkey" FOREIGN KEY ("inviteReceiverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

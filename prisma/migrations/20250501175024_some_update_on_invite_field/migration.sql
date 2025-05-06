/*
  Warnings:

  - You are about to drop the column `inviterId` on the `invites` table. All the data in the column will be lost.
  - Added the required column `inviteSenderId` to the `invites` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "invites" DROP CONSTRAINT "invites_inviterId_fkey";

-- AlterTable
ALTER TABLE "invites" DROP COLUMN "inviterId",
ADD COLUMN     "inviteSenderId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "invites" ADD CONSTRAINT "invites_inviteSenderId_fkey" FOREIGN KEY ("inviteSenderId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

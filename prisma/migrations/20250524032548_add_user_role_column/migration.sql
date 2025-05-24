/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `lastActiveAt` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `twoFASecret` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Session" DROP COLUMN "createdAt",
DROP COLUMN "lastActiveAt";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "twoFASecret",
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';

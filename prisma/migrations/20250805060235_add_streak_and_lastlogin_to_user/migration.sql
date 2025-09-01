/*
  Warnings:

  - You are about to drop the `UserLogin` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."UserLogin" DROP CONSTRAINT "UserLogin_userId_fkey";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "currentStreak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastLogin" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "public"."UserLogin";

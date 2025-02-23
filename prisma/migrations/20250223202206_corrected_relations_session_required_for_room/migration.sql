/*
  Warnings:

  - Made the column `sessionId` on table `Room` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Room" ALTER COLUMN "sessionId" SET NOT NULL;

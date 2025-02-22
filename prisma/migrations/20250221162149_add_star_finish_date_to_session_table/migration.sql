/*
  Warnings:

  - You are about to drop the column `date` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `roomId` on the `Session` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sessionId]` on the table `Room` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `endDate` to the `Session` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_roomId_fkey";

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "sessionId" TEXT;

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "date",
DROP COLUMN "roomId",
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Room_sessionId_key" ON "Room"("sessionId");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the `_MessageToUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_MessageToUser" DROP CONSTRAINT "_MessageToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_MessageToUser" DROP CONSTRAINT "_MessageToUser_B_fkey";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_MessageToUser";

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "BasicInfo" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "media" TEXT NOT NULL,
    "ageGroup" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BasicInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BasicInfo_userId_key" ON "BasicInfo"("userId");

-- AddForeignKey
ALTER TABLE "BasicInfo" ADD CONSTRAINT "BasicInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

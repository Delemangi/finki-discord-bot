/*
  Warnings:

  - You are about to drop the `VipPoll` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "VipPoll" DROP CONSTRAINT "VipPoll_pollId_fkey";

-- DropTable
DROP TABLE "VipPoll";

-- CreateTable
CREATE TABLE "SpecialPoll" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'add',
    "pollId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecialPoll_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SpecialPoll_pollId_key" ON "SpecialPoll"("pollId");

-- CreateIndex
CREATE UNIQUE INDEX "SpecialPoll_userId_type_key" ON "SpecialPoll"("userId", "type");

-- AddForeignKey
ALTER TABLE "SpecialPoll" ADD CONSTRAINT "SpecialPoll_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

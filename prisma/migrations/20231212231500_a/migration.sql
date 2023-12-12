/*
  Warnings:

  - You are about to drop the `VipBan` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "VipBan";

-- CreateTable
CREATE TABLE "Bar" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bar_userId_key" ON "Bar"("userId");

-- CreateEnum
CREATE TYPE "InfoMessageType" AS ENUM ('TEXT', 'IMAGE');

-- CreateTable
CREATE TABLE "InfoMessage" (
    "id" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "type" "InfoMessageType" NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InfoMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InfoMessage_index_key" ON "InfoMessage"("index");

/*
  Warnings:

  - You are about to drop the `Poll` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PollOption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PollVote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SpecialPoll` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PollOption" DROP CONSTRAINT "PollOption_pollId_fkey";

-- DropForeignKey
ALTER TABLE "PollVote" DROP CONSTRAINT "PollVote_optionId_fkey";

-- DropForeignKey
ALTER TABLE "PollVote" DROP CONSTRAINT "PollVote_pollId_fkey";

-- DropForeignKey
ALTER TABLE "SpecialPoll" DROP CONSTRAINT "SpecialPoll_pollId_fkey";

-- DropTable
DROP TABLE "Poll";

-- DropTable
DROP TABLE "PollOption";

-- DropTable
DROP TABLE "PollVote";

-- DropTable
DROP TABLE "SpecialPoll";

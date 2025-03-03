/*
  Warnings:

  - You are about to drop the `Link` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Question` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuestionLink` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "QuestionLink" DROP CONSTRAINT "QuestionLink_questionId_fkey";

-- DropTable
DROP TABLE "Link";

-- DropTable
DROP TABLE "Question";

-- DropTable
DROP TABLE "QuestionLink";

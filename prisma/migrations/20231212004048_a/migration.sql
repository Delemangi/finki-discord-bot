-- AlterTable
ALTER TABLE "SpecialPoll" ADD COLUMN     "timestamp" TIMESTAMP(3),
ALTER COLUMN "type" SET DEFAULT 'vipAdd';

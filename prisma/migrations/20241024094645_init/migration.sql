-- CreateEnum
CREATE TYPE "Type" AS ENUM ('AwayDay', 'TeamOuting', 'Celebration');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "eventType" "Type" NOT NULL DEFAULT 'AwayDay';

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

/*
  Warnings:

  - A unique constraint covering the columns `[accessKey]` on the table `Rooms` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Rooms" ADD COLUMN     "accessKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Rooms_accessKey_key" ON "Rooms"("accessKey");

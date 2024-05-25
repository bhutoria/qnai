/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `AccessTokens` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "AccessTokens_token_key";

-- CreateIndex
CREATE UNIQUE INDEX "AccessTokens_userId_key" ON "AccessTokens"("userId");

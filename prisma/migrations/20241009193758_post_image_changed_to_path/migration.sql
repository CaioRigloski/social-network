/*
  Warnings:

  - You are about to alter the column `picture` on the `post` table. The data in that column could be lost. The data in that column will be cast from `LongBlob` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `post` MODIFY `picture` VARCHAR(191) NOT NULL;

/*
  Warnings:

  - You are about to drop the `friend` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `friend` DROP FOREIGN KEY `Friend_friendId_fkey`;

-- DropTable
DROP TABLE `friend`;

-- CreateTable
CREATE TABLE `_UserFriends` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_UserFriends_AB_unique`(`A`, `B`),
    INDEX `_UserFriends_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_UserFriends` ADD CONSTRAINT `_UserFriends_A_fkey` FOREIGN KEY (`A`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserFriends` ADD CONSTRAINT `_UserFriends_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `isGuest` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `email` VARCHAR(191) NULL,
    MODIFY `password` VARCHAR(191) NULL;

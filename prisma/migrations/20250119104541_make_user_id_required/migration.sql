/*
  Warnings:

  - Added the required column `userId` to the `LabResult` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.
  - Made the column `userId` on table `Patient` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `userId` to the `Prescription` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Patient` DROP FOREIGN KEY `Patient_userId_fkey`;

-- AlterTable
ALTER TABLE `LabResult` ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `MedicalRecord` ADD COLUMN `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Patient` MODIFY `userId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Prescription` ADD COLUMN `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Patient` ADD CONSTRAINT `Patient_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MedicalRecord` ADD CONSTRAINT `MedicalRecord_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prescription` ADD CONSTRAINT `Prescription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LabResult` ADD CONSTRAINT `LabResult_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

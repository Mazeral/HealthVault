/*
  Warnings:

  - You are about to drop the column `firstName` on the `Patient` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `Patient` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[fullName]` on the table `Patient` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fullName` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Patient` DROP COLUMN `firstName`,
    DROP COLUMN `lastName`,
    ADD COLUMN `fullName` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Patient_fullName_key` ON `Patient`(`fullName`);

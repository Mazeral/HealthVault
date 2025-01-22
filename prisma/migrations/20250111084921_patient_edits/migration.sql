/*
  Warnings:

  - The values [NURSE] on the enum `User_role` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `age` to the `Patient` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sex` to the `Patient` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Patient` ADD COLUMN `age` INTEGER NOT NULL,
    ADD COLUMN `bloodGroup` ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NULL,
    ADD COLUMN `sex` ENUM('MALE', 'FEMALE') NOT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('ADMIN', 'DOCTOR') NOT NULL;

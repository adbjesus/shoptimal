/*
  Warnings:

  - Added the required column `price` to the `Price` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Price" ADD COLUMN     "price" INTEGER NOT NULL;

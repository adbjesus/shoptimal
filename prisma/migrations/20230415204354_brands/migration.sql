/*
  Warnings:

  - A unique constraint covering the columns `[name,bid]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bid` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "bid" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Brand" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_bid_key" ON "Product"("name", "bid");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_bid_fkey" FOREIGN KEY ("bid") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

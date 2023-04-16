/*
  Warnings:

  - You are about to drop the column `cid` on the `Location` table. All the data in the column will be lost.
  - You are about to drop the column `pid` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `sid` on the `Price` table. All the data in the column will be lost.
  - You are about to drop the column `bid` on the `Product` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name,brandId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `chainId` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chainId` to the `Price` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `Price` table without a default value. This is not possible if the table is not empty.
  - Added the required column `brandId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_cid_fkey";

-- DropForeignKey
ALTER TABLE "Price" DROP CONSTRAINT "Price_pid_fkey";

-- DropForeignKey
ALTER TABLE "Price" DROP CONSTRAINT "Price_sid_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_bid_fkey";

-- DropIndex
DROP INDEX "Product_name_bid_key";

-- AlterTable
ALTER TABLE "Location"
RENAME COLUMN "cid" TO "chainId";

-- AlterTable
ALTER TABLE "Price"
RENAME COLUMN "pid" TO "productId";
ALTER TABLE "Price"
RENAME COLUMN "sid" TO "chainId";

-- AlterTable
ALTER TABLE "Product"
RENAME COLUMN "bid" to "brandId";

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_brandId_key" ON "Product"("name", "brandId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "SupermarketChain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "SupermarketChain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

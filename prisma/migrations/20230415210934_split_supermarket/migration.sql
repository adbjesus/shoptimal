/*
  Warnings:

  - You are about to drop the `Supermarket` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Price" DROP CONSTRAINT "Price_sid_fkey";

-- DropTable
DROP TABLE "Supermarket";

-- CreateTable
CREATE TABLE "SupermarketChain" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "SupermarketChain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "cid" INTEGER NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SupermarketChain_name_key" ON "SupermarketChain"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Location_name_key" ON "Location"("name");

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_cid_fkey" FOREIGN KEY ("cid") REFERENCES "SupermarketChain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_sid_fkey" FOREIGN KEY ("sid") REFERENCES "SupermarketChain"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

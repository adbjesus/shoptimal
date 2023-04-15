/*
  Warnings:

  - A unique constraint covering the columns `[name,lat,lon]` on the table `Supermarket` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Supermarket_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Supermarket_name_lat_lon_key" ON "Supermarket"("name", "lat", "lon");

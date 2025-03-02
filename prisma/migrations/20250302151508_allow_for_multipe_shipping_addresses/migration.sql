-- DropIndex
DROP INDEX "ShippingAddress_userId_key";

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "shippingAddressId" TEXT;

-- AlterTable
ALTER TABLE "ShippingAddress" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shippingAddressId_fkey" FOREIGN KEY ("shippingAddressId") REFERENCES "ShippingAddress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add strength unit enum for product variants
CREATE TYPE "StrengthUnit" AS ENUM ('MG', 'IU', 'ML');

-- Add slug to products for stable public routing
ALTER TABLE "Product" ADD COLUMN "slug" TEXT;

-- Add product variants for strength/price management
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "strengthValue" DECIMAL(10,2) NOT NULL,
    "strengthUnit" "StrengthUnit" NOT NULL,
    "sku" TEXT NOT NULL,
    "priceCents" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");
CREATE INDEX "ProductVariant_strengthUnit_idx" ON "ProductVariant"("strengthUnit");

ALTER TABLE "ProductVariant"
ADD CONSTRAINT "ProductVariant_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Link batches to variants without breaking existing product linkage
ALTER TABLE "ProductBatch" ADD COLUMN "variantId" TEXT;

CREATE INDEX "ProductBatch_variantId_idx" ON "ProductBatch"("variantId");

ALTER TABLE "ProductBatch"
ADD CONSTRAINT "ProductBatch_variantId_fkey"
FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

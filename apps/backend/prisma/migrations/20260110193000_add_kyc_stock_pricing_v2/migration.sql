-- Add catalog visibility, KYC, and pricing enums
CREATE TYPE "ProductVisibility" AS ENUM ('B2C_ONLY', 'B2B_ONLY', 'BOTH');
CREATE TYPE "StockStatus" AS ENUM ('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'DISCONTINUED', 'BACKORDER');
CREATE TYPE "KycStatus" AS ENUM ('NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "DocumentType" AS ENUM ('BUSINESS_LICENSE', 'TAX_ID', 'FACILITY_LICENSE', 'OFFICER_ID', 'ADDRESS_PROOF');
CREATE TYPE "DocumentReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE "CatalogType" AS ENUM ('B2C_ONLY', 'B2B_ONLY');

-- Extend Product with visibility and stock fields
ALTER TABLE "Product" ADD COLUMN "visibility" "ProductVisibility" NOT NULL DEFAULT 'B2C_ONLY';
ALTER TABLE "Product" ADD COLUMN "isDraft" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Product" ADD COLUMN "currentStock" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Product" ADD COLUMN "lowStockThreshold" INTEGER DEFAULT 25;
ALTER TABLE "Product" ADD COLUMN "stockStatus" "StockStatus" NOT NULL DEFAULT 'OUT_OF_STOCK';
ALTER TABLE "Product" ADD COLUMN "expectedRestockDate" TIMESTAMP(3);
ALTER TABLE "Product" ADD COLUMN "displayOrder" INTEGER;
ALTER TABLE "Product" ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- File storage for COAs and KYC documents
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimetype" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "storageProvider" TEXT NOT NULL DEFAULT 'r2',
    "storageBucket" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "storageUrl" TEXT,
    "uploadedBy" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "File_storageKey_idx" ON "File"("storageKey");
CREATE INDEX "File_uploadedBy_idx" ON "File"("uploadedBy");
CREATE INDEX "File_storageBucket_idx" ON "File"("storageBucket");

-- Extend ProductBatch with COA metadata and availability
ALTER TABLE "ProductBatch" ADD COLUMN "testDate" TIMESTAMP(3);
ALTER TABLE "ProductBatch" ADD COLUMN "methodology" TEXT;
ALTER TABLE "ProductBatch" ADD COLUMN "concentration" DECIMAL(10,2);
ALTER TABLE "ProductBatch" ADD COLUMN "molecularWeight" DECIMAL(10,2);
ALTER TABLE "ProductBatch" ADD COLUMN "appearance" TEXT;
ALTER TABLE "ProductBatch" ADD COLUMN "solubility" TEXT;
ALTER TABLE "ProductBatch" ADD COLUMN "isAvailable" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "ProductBatch"
ADD CONSTRAINT "ProductBatch_coaFileId_fkey"
FOREIGN KEY ("coaFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "ProductBatch_variantId_isActive_idx" ON "ProductBatch"("variantId", "isActive");

-- Tiered pricing
CREATE TABLE "PriceTier" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "batchId" TEXT,
    "catalogType" "CatalogType" NOT NULL,
    "minQuantity" INTEGER NOT NULL DEFAULT 1,
    "maxQuantity" INTEGER,
    "price" DECIMAL(12,2) NOT NULL,
    "label" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceTier_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PriceTier_productId_catalogType_minQuantity_idx"
ON "PriceTier"("productId", "catalogType", "minQuantity");

CREATE INDEX "PriceTier_batchId_catalogType_minQuantity_idx"
ON "PriceTier"("batchId", "catalogType", "minQuantity");

ALTER TABLE "PriceTier"
ADD CONSTRAINT "PriceTier_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PriceTier"
ADD CONSTRAINT "PriceTier_batchId_fkey"
FOREIGN KEY ("batchId") REFERENCES "ProductBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Stock notifications
CREATE TABLE "StockNotification" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "notified" BOOLEAN NOT NULL DEFAULT false,
    "notifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockNotification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "StockNotification_productId_notified_idx"
ON "StockNotification"("productId", "notified");

CREATE INDEX "StockNotification_email_idx"
ON "StockNotification"("email");

CREATE UNIQUE INDEX "StockNotification_productId_email_notified_key"
ON "StockNotification"("productId", "email", "notified");

ALTER TABLE "StockNotification"
ADD CONSTRAINT "StockNotification_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "StockNotification"
ADD CONSTRAINT "StockNotification_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- KYC workflow
CREATE TABLE "KycVerification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "KycStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "approvedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "lastRejectionAt" TIMESTAMP(3),
    "canResubmitAt" TIMESTAMP(3),
    "internalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KycVerification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "KycVerification_userId_key" ON "KycVerification"("userId");
CREATE INDEX "KycVerification_status_idx" ON "KycVerification"("status");
CREATE INDEX "KycVerification_canResubmitAt_idx" ON "KycVerification"("canResubmitAt");

ALTER TABLE "KycVerification"
ADD CONSTRAINT "KycVerification_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "KycDocument" (
    "id" TEXT NOT NULL,
    "verificationId" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "fileId" TEXT NOT NULL,
    "status" "DocumentReviewStatus" NOT NULL DEFAULT 'PENDING',
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "rejectionReason" TEXT,

    CONSTRAINT "KycDocument_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "KycDocument_verificationId_documentType_idx"
ON "KycDocument"("verificationId", "documentType");

CREATE INDEX "KycDocument_status_idx"
ON "KycDocument"("status");

ALTER TABLE "KycDocument"
ADD CONSTRAINT "KycDocument_verificationId_fkey"
FOREIGN KEY ("verificationId") REFERENCES "KycVerification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "KycDocument"
ADD CONSTRAINT "KycDocument_fileId_fkey"
FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Extend AuditLog for compliance tracking
ALTER TABLE "AuditLog" ADD COLUMN "adminId" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN "entityType" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN "entityId" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN "changesBefore" JSONB;
ALTER TABLE "AuditLog" ADD COLUMN "changesAfter" JSONB;
ALTER TABLE "AuditLog" ADD COLUMN "ipAddress" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN "userAgent" TEXT;
ALTER TABLE "AuditLog" ADD COLUMN "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");
CREATE INDEX "AuditLog_adminId_idx" ON "AuditLog"("adminId");
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- Enforce single active batch per variant
CREATE UNIQUE INDEX "ProductBatch_variant_active_unique"
ON "ProductBatch"("variantId")
WHERE "isActive" = true;

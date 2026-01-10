import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { FileStorageService } from '../files/file-storage.service';

@Injectable()
export class BatchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileStorage: FileStorageService,
  ) {}

  getHealth(): string {
    return 'batches-ok';
  }

  /**
   * Upload COA file for a batch
   * Extracts purity percentage and stores COA metadata
   */
  async uploadCoa(
    batchId: string,
    file: Express.Multer.File,
    uploadedById: string,
    purityPercent?: number,
    testingLab?: string,
    activateOnUpload: boolean = false,
  ) {
    // Verify batch exists
    const batch = await this.prisma.productBatch.findUnique({
      where: { id: batchId },
      include: { product: true, variant: true },
    });

    if (!batch) {
      throw new NotFoundException(`Batch ${batchId} not found`);
    }

    // Validate file type (PDF only for COAs)
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('COA files must be PDF format');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('COA files must be 5MB or smaller');
    }

    const fileRecord = await this.fileStorage.uploadFile(file, {
      bucket: 'coa',
      uploadedBy: uploadedById,
      prefix: 'coa',
    });

    const updateData: Prisma.ProductBatchUpdateInput = {
      coaFileId: fileRecord.id,
      testingLab: testingLab || 'Unknown Lab',
      purityPercent: purityPercent ?? batch.purityPercent,
    };

    if (activateOnUpload) {
      if (!batch.variantId) {
        throw new BadRequestException('Batch must be linked to a variant');
      }

      if (!batch.isAvailable) {
        throw new BadRequestException('Batch is marked unavailable');
      }

      if (batch.expiresAt && batch.expiresAt < new Date()) {
        throw new BadRequestException('Batch is expired');
      }

      await this.prisma.productBatch.updateMany({
        where: {
          variantId: batch.variantId,
          isActive: true,
          id: { not: batchId },
        },
        data: { isActive: false },
      });

      updateData.isActive = true;
    }

    // Update ProductBatch with COA info and optionally activate
    const updatedBatch = await this.prisma.productBatch.update({
      where: { id: batchId },
      data: updateData,
      include: {
        coaFile: true,
        product: true,
      },
    });

    return {
      batch: updatedBatch,
      coaFile: fileRecord,
      message: activateOnUpload
        ? 'COA uploaded successfully and batch activated'
        : 'COA uploaded successfully',
    };
  }

  /**
   * Get COA file for a batch
   */
  async getCoaFile(batchId: string) {
    const batch = await this.prisma.productBatch.findUnique({
      where: { id: batchId },
      include: { coaFile: true },
    });

    if (!batch) {
      throw new NotFoundException(`Batch ${batchId} not found`);
    }

    if (!batch.coaFileId) {
      throw new NotFoundException(`No COA found for batch ${batchId}`);
    }

    const downloadUrl = await this.fileStorage.getSignedDownloadUrl(
      batch.coaFileId,
      86400,
    );

    return {
      fileId: batch.coaFileId,
      downloadUrl,
      uploadedAt: batch.coaFile?.createdAt ?? null,
      purityPercent: batch.purityPercent,
      testingLab: batch.testingLab,
      batchCode: batch.batchCode,
    };
  }

  /**
   * Get batch details with all files
   */
  async getBatchById(batchId: string) {
    const batch = await this.prisma.productBatch.findUnique({
      where: { id: batchId },
      include: {
        product: true,
        coaFile: true,
      },
    });

    if (!batch) {
      throw new NotFoundException(`Batch ${batchId} not found`);
    }

    return batch;
  }

  /**
   * List all batches for a product with COA status
   */
  async getBatchesByProduct(productId: string) {
    const batches = await this.prisma.productBatch.findMany({
      where: { productId },
      include: {
        coaFile: true,
      },
      orderBy: { manufacturedAt: 'desc' },
    });

    return batches.map(batch => ({
      id: batch.id,
      variantId: batch.variantId,
      batchCode: batch.batchCode,
      purityPercent: batch.purityPercent,
      manufacturedAt: batch.manufacturedAt,
      expiresAt: batch.expiresAt,
      testingLab: batch.testingLab,
      isActive: batch.isActive,
      hasCoa: !!batch.coaFileId,
    }));
  }

  /**
   * List all batches for a variant with COA status
   */
  async getBatchesByVariant(variantId: string) {
    const batches = await this.prisma.productBatch.findMany({
      where: { variantId },
      include: {
        coaFile: true,
      },
      orderBy: { manufacturedAt: 'desc' },
    });

    return batches.map(batch => ({
      id: batch.id,
      variantId: batch.variantId,
      batchCode: batch.batchCode,
      purityPercent: batch.purityPercent,
      manufacturedAt: batch.manufacturedAt,
      expiresAt: batch.expiresAt,
      testingLab: batch.testingLab,
      isActive: batch.isActive,
      hasCoa: !!batch.coaFileId,
    }));
  }

  /**
   * Update batch purity from COA review
   */
  async updateBatchPurity(batchId: string, purityPercent: number, testingLab?: string) {
    const batch = await this.prisma.productBatch.update({
      where: { id: batchId },
      data: {
        purityPercent,
        ...(testingLab && { testingLab }),
      },
    });

    return batch;
  }

  /**
   * Deactivate batch (e.g., if COA fails review)
   */
  async deactivateBatch(batchId: string, reason?: string) {
    const batch = await this.prisma.productBatch.update({
      where: { id: batchId },
      data: {
        isActive: false,
      },
    });

    return {
      batch,
      message: reason || 'Batch deactivated',
    };
  }
}

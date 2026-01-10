import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class BatchesService {
  constructor(private readonly prisma: PrismaService) {}

  getHealth(): string {
    return 'batches-ok';
  }

  /**
   * Upload COA file for a batch
   * Extracts purity percentage and activates batch if valid
   */
  async uploadCoa(
    batchId: string,
    file: Express.Multer.File,
    uploadedById: string,
    purityPercent?: number,
    testingLab?: string,
    activateOnUpload: boolean = true,
  ) {
    // Verify batch exists
    const batch = await this.prisma.productBatch.findUnique({
      where: { id: batchId },
      include: { product: true },
    });

    if (!batch) {
      throw new NotFoundException(`Batch ${batchId} not found`);
    }

    // Validate file type (PDF only for COAs)
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('COA files must be PDF format');
    }

    // Store file (in production, use S3/Cloudinary)
    const uploadDir = path.join(process.cwd(), 'uploads', 'coa');
    await fs.mkdir(uploadDir, { recursive: true });

    const fileName = `${batchId}_COA_${Date.now()}.pdf`;
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, file.buffer);

    // Create BatchFile record
    const batchFile = await this.prisma.batchFile.create({
      data: {
        batchId,
        type: 'COA',
        filePath: `/uploads/coa/${fileName}`,
        uploadedById,
      },
    });

    const updateData: Prisma.ProductBatchUpdateInput = {
      coaFileId: batchFile.id,
      testingLab: testingLab || 'Unknown Lab',
      purityPercent: purityPercent ?? batch.purityPercent,
    };

    if (activateOnUpload) {
      updateData.isActive = true;
    }

    // Update ProductBatch with COA info and optionally activate
    const updatedBatch = await this.prisma.productBatch.update({
      where: { id: batchId },
      data: updateData,
      include: {
        files: true,
        product: true,
      },
    });

    return {
      batch: updatedBatch,
      coaFile: batchFile,
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
      include: {
        files: {
          where: { type: 'COA' },
        },
      },
    });

    if (!batch) {
      throw new NotFoundException(`Batch ${batchId} not found`);
    }

    if (!batch.coaFileId) {
      throw new NotFoundException(`No COA found for batch ${batchId}`);
    }

    const coaFile = batch.files.find(f => f.id === batch.coaFileId);

    if (!coaFile) {
      throw new NotFoundException(`COA file not found`);
    }

    return {
      fileId: coaFile.id,
      filePath: coaFile.filePath,
      uploadedAt: coaFile.createdAt,
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
        files: {
          orderBy: { createdAt: 'desc' },
        },
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
        files: {
          where: { type: 'COA' },
        },
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
      coaFileCount: batch.files.length,
    }));
  }

  /**
   * List all batches for a variant with COA status
   */
  async getBatchesByVariant(variantId: string) {
    const batches = await this.prisma.productBatch.findMany({
      where: { variantId },
      include: {
        files: {
          where: { type: 'COA' },
        },
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
      coaFileCount: batch.files.length,
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

import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BatchesService } from './batches.service';

@Controller('batches')
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Get('health')
  getHealth(): string {
    return this.batchesService.getHealth();
  }

  /**
   * Upload COA for a batch
   * POST /batches/:batchId/coa
   */
  @Post(':batchId/coa')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCoa(
    @Param('batchId') batchId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { uploadedById: string; purityPercent?: number; testingLab?: string },
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return this.batchesService.uploadCoa(
      batchId,
      file,
      body.uploadedById,
      body.purityPercent ? parseFloat(body.purityPercent.toString()) : undefined,
      body.testingLab,
    );
  }

  /**
   * Get COA file info for a batch
   * GET /batches/:batchId/coa
   */
  @Get(':batchId/coa')
  async getCoaFile(@Param('batchId') batchId: string) {
    return this.batchesService.getCoaFile(batchId);
  }

  /**
   * Get batch details
   * GET /batches/:batchId
   */
  @Get(':batchId')
  async getBatchById(@Param('batchId') batchId: string) {
    return this.batchesService.getBatchById(batchId);
  }

  /**
   * Get all batches for a product
   * GET /batches/product/:productId
   */
  @Get('product/:productId')
  async getBatchesByProduct(@Param('productId') productId: string) {
    return this.batchesService.getBatchesByProduct(productId);
  }

  /**
   * Update batch purity
   * PATCH /batches/:batchId/purity
   */
  @Patch(':batchId/purity')
  async updateBatchPurity(
    @Param('batchId') batchId: string,
    @Body() body: { purityPercent: number; testingLab?: string },
  ) {
    return this.batchesService.updateBatchPurity(
      batchId,
      body.purityPercent,
      body.testingLab,
    );
  }

  /**
   * Deactivate batch
   * PATCH /batches/:batchId/deactivate
   */
  @Patch(':batchId/deactivate')
  async deactivateBatch(
    @Param('batchId') batchId: string,
    @Body() body: { reason?: string },
  ) {
    return this.batchesService.deactivateBatch(batchId, body.reason);
  }
}

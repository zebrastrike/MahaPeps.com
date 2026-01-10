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
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { BatchesService } from './batches.service';
import { AuditService } from '../../audit/audit.service';

@Controller('batches')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class BatchesController {
  constructor(
    private readonly batchesService: BatchesService,
    private readonly auditService: AuditService,
  ) {}

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
    @Body() body: { purityPercent?: number; testingLab?: string },
    @Req() request: Request,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const result = await this.batchesService.uploadCoa(
      batchId,
      file,
      (request as any).user?.id,
      body.purityPercent ? parseFloat(body.purityPercent.toString()) : undefined,
      body.testingLab,
    );

    await this.auditService.log({
      adminId: (request as any).user?.id,
      action: 'BATCH_COA_UPLOAD',
      entityType: 'ProductBatch',
      entityId: batchId,
      metadata: {
        purityPercent: body.purityPercent ?? null,
        testingLab: body.testingLab ?? null,
        coaFileId: result?.coaFile?.id ?? null,
      },
    });

    return result;
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
   * Get all batches for a variant
   * GET /batches/variant/:variantId
   */
  @Get('variant/:variantId')
  async getBatchesByVariant(@Param('variantId') variantId: string) {
    return this.batchesService.getBatchesByVariant(variantId);
  }

  /**
   * Update batch purity
   * PATCH /batches/:batchId/purity
   */
  @Patch(':batchId/purity')
  async updateBatchPurity(
    @Param('batchId') batchId: string,
    @Body() body: { purityPercent: number; testingLab?: string },
    @Req() request: Request,
  ) {
    const batch = await this.batchesService.updateBatchPurity(
      batchId,
      body.purityPercent,
      body.testingLab,
    );

    await this.auditService.log({
      adminId: (request as any).user?.id,
      action: 'BATCH_PURITY_UPDATE',
      entityType: 'ProductBatch',
      entityId: batchId,
      metadata: {
        purityPercent: body.purityPercent,
        testingLab: body.testingLab ?? null,
      },
    });

    return batch;
  }

  /**
   * Deactivate batch
   * PATCH /batches/:batchId/deactivate
   */
  @Patch(':batchId/deactivate')
  async deactivateBatch(
    @Param('batchId') batchId: string,
    @Body() body: { reason?: string },
    @Req() request: Request,
  ) {
    const result = await this.batchesService.deactivateBatch(batchId, body.reason);

    await this.auditService.log({
      adminId: (request as any).user?.id,
      action: 'BATCH_DEACTIVATE',
      entityType: 'ProductBatch',
      entityId: batchId,
      metadata: {
        reason: body.reason ?? null,
      },
    });

    return result;
  }
}

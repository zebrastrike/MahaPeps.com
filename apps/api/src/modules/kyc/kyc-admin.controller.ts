import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DocumentReviewStatus, KycStatus, UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { KycService } from './kyc.service';

@Controller('admin/kyc')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class KycAdminController {
  constructor(private readonly kycService: KycService) {}

  @Get()
  async list(@Query('status') status?: string) {
    const parsedStatus = status
      ? this.parseKycStatus(status)
      : undefined;
    return this.kycService.listForAdmin(parsedStatus);
  }

  @Get(':kycId')
  async getById(@Param('kycId') kycId: string) {
    return this.kycService.getForAdmin(kycId);
  }

  @Post(':kycId/approve')
  async approve(@Param('kycId') kycId: string, @Req() request: any) {
    return this.kycService.approveKyc(kycId, request.user.id);
  }

  @Post(':kycId/reject')
  async reject(
    @Param('kycId') kycId: string,
    @Body()
    body: { rejectionReason: string; internalNotes?: string },
    @Req() request: any,
  ) {
    if (!body?.rejectionReason) {
      throw new BadRequestException('rejectionReason is required');
    }
    return this.kycService.rejectKyc(
      kycId,
      request.user.id,
      body.rejectionReason,
      body.internalNotes,
    );
  }

  @Post('documents/:documentId/review')
  async reviewDocument(
    @Param('documentId') documentId: string,
    @Body()
    body: { status: string; rejectionReason?: string },
    @Req() request: any,
  ) {
    if (!body?.status) {
      throw new BadRequestException('status is required');
    }

    const status = this.parseDocumentStatus(body.status);
    return this.kycService.reviewDocument(
      documentId,
      status,
      request.user.id,
      body.rejectionReason,
    );
  }

  private parseKycStatus(value: string): KycStatus {
    const normalized = value.toUpperCase();
    if (!Object.values(KycStatus).includes(normalized as KycStatus)) {
      throw new BadRequestException('Invalid status');
    }
    return normalized as KycStatus;
  }

  private parseDocumentStatus(value: string): DocumentReviewStatus {
    const normalized = value.toUpperCase();
    if (
      !Object.values(DocumentReviewStatus).includes(
        normalized as DocumentReviewStatus,
      )
    ) {
      throw new BadRequestException('Invalid document status');
    }
    return normalized as DocumentReviewStatus;
  }
}

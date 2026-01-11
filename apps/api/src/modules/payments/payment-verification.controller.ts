import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PaymentVerificationService } from './payment-verification.service';

@Controller('payments')
export class PaymentVerificationController {
  constructor(
    private readonly paymentVerification: PaymentVerificationService,
  ) {}

  /**
   * Submit payment proof (Zelle/CashApp screenshot)
   * POST /payments/:token/proof
   */
  @Post(':token/proof')
  @UseInterceptors(FileInterceptor('proofFile'))
  async submitPaymentProof(
    @Param('token') token: string,
    @UploadedFile() proofFile: Express.Multer.File,
    @Body()
    body: {
      method: 'ZELLE' | 'CASHAPP' | 'WIRE_TRANSFER';
      transactionReference?: string;
    },
    @Req() request: Request,
  ) {
    if (!proofFile) {
      throw new BadRequestException('Payment proof file is required');
    }

    const userAgent = request.headers['user-agent'];

    return this.paymentVerification.submitPaymentProof({
      paymentToken: token,
      method: body.method,
      transactionReference: body.transactionReference,
      proofFile,
      userAgent,
    });
  }

  /**
   * Get pending payments (Admin only)
   * GET /payments/pending
   */
  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getPendingPayments() {
    return this.paymentVerification.getPendingPayments();
  }

  /**
   * Approve payment (Admin only)
   * POST /payments/:paymentId/approve
   */
  @Post(':paymentId/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async approvePayment(
    @Param('paymentId') paymentId: string,
    @Req() request: Request,
  ) {
    const adminId = (request as any).user?.id;
    return this.paymentVerification.approvePayment(paymentId, adminId);
  }

  /**
   * Reject payment (Admin only)
   * POST /payments/:paymentId/reject
   */
  @Post(':paymentId/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async rejectPayment(
    @Param('paymentId') paymentId: string,
    @Body() body: { reason: string },
    @Req() request: Request,
  ) {
    const adminId = (request as any).user?.id;
    return this.paymentVerification.rejectPayment(paymentId, adminId, body.reason);
  }
}

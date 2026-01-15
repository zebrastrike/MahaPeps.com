import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { PaymentVerificationService } from '../payments/payment-verification.service';
import { OrdersService } from '../orders/orders.service';

@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminPaymentsController {
  constructor(
    private readonly paymentVerification: PaymentVerificationService,
    private readonly orders: OrdersService,
  ) {}

  /**
   * Get all pending payments awaiting admin review
   * GET /api/admin/payments/pending
   */
  @Get('pending')
  async getPendingPayments() {
    return this.paymentVerification.getPendingPayments();
  }

  /**
   * Approve a payment that has proof submitted
   * POST /api/admin/payments/:paymentId/approve
   */
  @Post(':paymentId/approve')
  async approvePayment(
    @Param('paymentId') paymentId: string,
    @Request() req: any,
  ) {
    return this.paymentVerification.approvePayment(paymentId, req.user.id);
  }

  /**
   * Reject a payment
   * POST /api/admin/payments/:paymentId/reject
   */
  @Post(':paymentId/reject')
  async rejectPayment(
    @Param('paymentId') paymentId: string,
    @Body() body: { reason: string },
    @Request() req: any,
  ) {
    return this.paymentVerification.rejectPayment(
      paymentId,
      req.user.id,
      body.reason,
    );
  }

  /**
   * Mark order as paid directly (when admin sees Zelle/CashApp come in)
   * No payment proof required - used when Scott manually confirms payment
   * POST /api/admin/payments/orders/:orderId/mark-paid
   */
  @Post('orders/:orderId/mark-paid')
  async markOrderAsPaid(
    @Param('orderId') orderId: string,
    @Body() body: {
      method: 'ZELLE' | 'CASHAPP' | 'WIRE_TRANSFER';
      transactionReference?: string;
      notes?: string;
    },
    @Request() req: any,
  ) {
    return this.orders.markAsPaidByAdmin({
      orderId,
      adminId: req.user.id,
      method: body.method,
      transactionReference: body.transactionReference,
      notes: body.notes,
    });
  }
}

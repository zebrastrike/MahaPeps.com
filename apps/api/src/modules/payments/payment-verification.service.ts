import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { FileStorageService } from '../files/file-storage.service';
import { AuditService } from '../../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailTemplatesService } from '../notifications/email-templates.service';

@Injectable()
export class PaymentVerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileStorage: FileStorageService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
    private readonly emailTemplates: EmailTemplatesService,
  ) {}

  /**
   * User submits payment proof (screenshot/receipt)
   * POST /payments/:paymentLinkToken/proof
   */
  async submitPaymentProof(params: {
    paymentToken: string;
    method: 'ZELLE' | 'CASHAPP' | 'WIRE_TRANSFER';
    transactionReference?: string;
    proofFile: Express.Multer.File;
    userAgent?: string;
  }) {
    // Find payment link
    const paymentLink = await this.prisma.paymentLink.findUnique({
      where: { token: params.paymentToken },
      include: {
        order: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!paymentLink) {
      throw new NotFoundException('Payment link not found');
    }

    if (paymentLink.status === 'PAID') {
      throw new BadRequestException('Payment already completed');
    }

    if (paymentLink.status === 'EXPIRED' || paymentLink.expiresAt < new Date()) {
      throw new BadRequestException('Payment link expired');
    }

    // Upload proof file to storage
    const proofFileRecord = await this.fileStorage.uploadFile(params.proofFile, {
      bucket: 'payment-proofs',
      uploadedBy: paymentLink.order.userId,
      prefix: `payment-proof/${paymentLink.orderId}`,
    });

    // Create Payment record with proof
    const payment = await this.prisma.payment.create({
      data: {
        orderId: paymentLink.orderId,
        amount: paymentLink.amount,
        currency: paymentLink.currency,
        status: PaymentStatus.INITIATED,
        method: params.method,
        paymentProof: proofFileRecord.storageUrl || proofFileRecord.storageKey,
        transactionReference: params.transactionReference,
      },
    });

    // Update payment link status
    await this.prisma.paymentLink.update({
      where: { id: paymentLink.id },
      data: { status: 'CLICKED' },
    });

    // Audit log
    await this.audit.log({
      userId: paymentLink.order.userId,
      action: 'PAYMENT_PROOF_SUBMITTED',
      entityType: 'Payment',
      entityId: payment.id,
      metadata: {
        orderId: paymentLink.orderId,
        method: params.method,
        amount: paymentLink.amount.toString(),
      },
      userAgent: params.userAgent,
    });

    return {
      paymentId: payment.id,
      status: 'PENDING_VERIFICATION',
      message: 'Payment proof submitted successfully. Admin will verify within 24-48 hours.',
    };
  }

  /**
   * Admin approves payment
   * POST /admin/payments/:paymentId/approve
   */
  async approvePayment(paymentId: string, adminId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.CAPTURED) {
      throw new BadRequestException('Payment already approved');
    }

    // Update payment to CAPTURED (approved)
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.CAPTURED,
        verifiedById: adminId,
        verifiedAt: new Date(),
      },
    });

    // Update order status to PAID
    await this.prisma.order.update({
      where: { id: payment.orderId },
      data: {
        status: OrderStatus.PAID,
      },
    });

    // Update payment link to PAID
    const paymentLink = await this.prisma.paymentLink.findUnique({
      where: { orderId: payment.orderId },
    });

    if (paymentLink) {
      await this.prisma.paymentLink.update({
        where: { id: paymentLink.id },
        data: { status: 'PAID' },
      });
    }

    // Audit log
    await this.audit.log({
      adminId,
      action: 'PAYMENT_APPROVED',
      entityType: 'Payment',
      entityId: paymentId,
      metadata: {
        orderId: payment.orderId,
        amount: payment.amount.toString(),
        method: payment.method,
      },
    });

    // Send payment verified email
    try {
      const emailTemplate = this.emailTemplates.getPaymentVerifiedEmail({
        orderId: payment.order.id,
        customerEmail: payment.order.user.email,
        orderTotal: payment.amount.toString(),
      });

      await this.notifications.sendEmail({
        to: payment.order.user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
    } catch (error) {
      // Log but don't fail approval if email fails
      console.error('Failed to send payment verified email:', error);
    }

    return {
      paymentId,
      orderId: payment.orderId,
      status: 'APPROVED',
      message: 'Payment approved successfully',
    };
  }

  /**
   * Admin rejects payment
   * POST /admin/payments/:paymentId/reject
   */
  async rejectPayment(paymentId: string, adminId: string, reason: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.CAPTURED) {
      throw new BadRequestException('Cannot reject approved payment');
    }

    // Update payment to FAILED
    await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.FAILED,
        metadata: {
          rejectionReason: reason,
          rejectedBy: adminId,
          rejectedAt: new Date().toISOString(),
        },
      },
    });

    // Audit log
    await this.audit.log({
      adminId,
      action: 'PAYMENT_REJECTED',
      entityType: 'Payment',
      entityId: paymentId,
      metadata: {
        orderId: payment.orderId,
        reason,
      },
    });

    return {
      paymentId,
      status: 'REJECTED',
      message: 'Payment rejected',
    };
  }

  /**
   * Get pending payments for admin review
   * GET /admin/payments/pending
   */
  async getPendingPayments() {
    const payments = await this.prisma.payment.findMany({
      where: {
        status: PaymentStatus.INITIATED,
      },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
            items: {
              include: {
                product: true,
              },
            },
            shippingAddress: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return payments.map((payment) => ({
      paymentId: payment.id,
      orderId: payment.orderId,
      amount: parseFloat(payment.amount.toString()),
      currency: payment.currency,
      method: payment.method,
      transactionReference: payment.transactionReference,
      paymentProof: payment.paymentProof,
      submittedAt: payment.createdAt,
      user: payment.order.user,
      orderSummary: {
        itemCount: payment.order.items.length,
        subtotal: parseFloat(payment.order.subtotal.toString()),
        shipping: parseFloat(payment.order.shipping.toString()),
        total: parseFloat(payment.order.total.toString()),
      },
    }));
  }
}

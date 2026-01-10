import { BadRequestException, Injectable } from '@nestjs/common';
import { AuditService } from '../../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto, MarkOrderPaidDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly auditService: AuditService,
  ) {}

  getHealth(): string {
    return 'orders-ok';
  }

  async createOrder(dto: CreateOrderDto, userId: string, ipAddress: string) {
    const { compliance } = dto;
    if (
      !compliance.researchPurposeOnly ||
      !compliance.responsibilityAccepted ||
      !compliance.noMedicalAdvice ||
      !compliance.ageConfirmation ||
      !compliance.termsAccepted
    ) {
      throw new BadRequestException('All compliance checkboxes must be accepted');
    }

    const subtotal = dto.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );
    const tax = subtotal * 0.08;
    const shippingCost = 15.0;
    const total = subtotal + tax + shippingCost;

    const shippingAddress = await this.prisma.address.create({
      data: dto.shippingAddress,
    });

    const billingAddress = await this.prisma.address.create({
      data: dto.billingAddress,
    });

    const order = await this.prisma.order.create({
      data: {
        userId,
        accountType: 'RETAIL',
        status: 'DRAFT',
        subtotal,
        tax,
        shipping: shippingCost,
        total,
        shippingAddressId: shippingAddress.id,
        billingAddressId: billingAddress.id,
        items: {
          create: dto.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    await this.prisma.complianceAcknowledgment.create({
      data: {
        orderId: order.id,
        userId,
        researchPurposeOnly: compliance.researchPurposeOnly,
        responsibilityAccepted: compliance.responsibilityAccepted,
        noMedicalAdvice: compliance.noMedicalAdvice,
        ageConfirmation: compliance.ageConfirmation,
        termsAccepted: compliance.termsAccepted,
        ipAddress,
        userAgent: compliance.userAgent,
      },
    });

    const updatedOrder = await this.prisma.order.update({
      where: { id: order.id },
      data: { status: 'PENDING_PAYMENT' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
        shippingAddress: true,
        billingAddress: true,
      },
    });

    try {
      await this.notificationsService.sendInvoiceEmail(updatedOrder as any);
    } catch (error) {
      console.error('Failed to send invoice email:', error);
    }

    await this.auditService.log({
      userId,
      action: 'order_created',
      entityType: 'Order',
      entityId: updatedOrder.id,
      metadata: { total: updatedOrder.total },
    });

    return updatedOrder;
  }

  async markOrderPaid(orderId: string, dto: MarkOrderPaidDto, adminId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException('Order is not in PENDING_PAYMENT status');
    }

    await this.prisma.payment.create({
      data: {
        orderId,
        amount: order.total,
        currency: 'USD',
        status: 'CAPTURED',
        method: dto.method,
        transactionReference: dto.transactionReference,
        paymentProof: dto.paymentProof,
        verifiedById: adminId,
        verifiedAt: new Date(),
      },
    });

    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'PAID' },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
        user: true,
      },
    });

    await this.auditService.log({
      adminId,
      action: 'payment_verified',
      entityType: 'Order',
      entityId: orderId,
      metadata: { total: updatedOrder.total },
    });

    return updatedOrder;
  }

  async getOrderById(orderId: string) {
    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
        shipments: true,
        user: true,
        shippingAddress: true,
        billingAddress: true,
        complianceAcknowledgment: true,
      },
    });
  }

  async getUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
        shipments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}

import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { AuditService } from '../../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOrderDto, MarkOrderPaidDto } from './dto/create-order.dto';
import { ShippoService } from './shippo.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly auditService: AuditService,
    private readonly shippoService: ShippoService,
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
      include: {
        payments: true,
        user: true,
        shippingAddress: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException('Order is not in PENDING_PAYMENT status');
    }

    const paidAt = new Date();

    // Create payment record
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
        verifiedAt: paidAt,
      },
    });

    // Calculate expected ship date based on processing type and payment time
    const expectedShipDate = this.calculateExpectedShipDate(order.processingType, paidAt);

    // Update order status and paidAt timestamp
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PAID',
        paidAt,
        expectedShipDate,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        payments: true,
        user: true,
        shippingAddress: true,
        billingAddress: true,
      },
    });

    // Log audit trail
    await this.auditService.log({
      adminId,
      action: 'payment_verified',
      entityType: 'Order',
      entityId: orderId,
      metadata: {
        total: updatedOrder.total,
        paymentMethod: dto.method,
        processingType: order.processingType,
        expectedShipDate: expectedShipDate.toISOString(),
      },
    });

    // Send payment verified email to customer
    try {
      await this.notificationsService.sendPaymentVerifiedEmail({
        orderId: updatedOrder.id,
        customerEmail: updatedOrder.user.email,
        orderTotal: updatedOrder.total.toFixed(2),
      });
      this.logger.log(`Payment verified email sent for order ${orderId}`);
    } catch (error) {
      this.logger.error(`Failed to send payment verified email for order ${orderId}:`, error);
    }

    // Auto-create Shippo order (draft mode)
    try {
      await this.shippoService.createShippoOrder(updatedOrder);
      this.logger.log(`Shippo order created for order ${orderId}`);
    } catch (error) {
      this.logger.error(`Failed to create Shippo order for order ${orderId}:`, error);
      // Don't throw - this is a non-critical operation, owner can create manually
    }

    return updatedOrder;
  }

  /**
   * Calculate expected ship date based on processing type and payment time
   */
  private calculateExpectedShipDate(processingType: string, paidAt: Date): Date {
    const now = new Date(paidAt);
    const hour = now.getHours();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Check if it's a weekend
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // If weekend, ship on Monday
    if (isWeekend) {
      const daysUntilMonday = dayOfWeek === 0 ? 1 : 2; // Sunday=1, Saturday=2
      const monday = new Date(now);
      monday.setDate(monday.getDate() + daysUntilMonday);
      return monday;
    }

    // Weekday processing
    switch (processingType) {
      case 'RUSH':
        // Same day if before 10am MST, otherwise next business day
        if (hour < 10) {
          return now;
        } else {
          const nextDay = new Date(now);
          nextDay.setDate(nextDay.getDate() + 1);
          // If next day is Saturday, ship Monday
          if (nextDay.getDay() === 6) {
            nextDay.setDate(nextDay.getDate() + 2);
          }
          // If next day is Sunday, ship Monday
          if (nextDay.getDay() === 0) {
            nextDay.setDate(nextDay.getDate() + 1);
          }
          return nextDay;
        }

      case 'EXPEDITED':
        // 1 business day
        const expeditedDate = new Date(now);
        expeditedDate.setDate(expeditedDate.getDate() + 1);
        // Skip weekend
        if (expeditedDate.getDay() === 6) {
          expeditedDate.setDate(expeditedDate.getDate() + 2);
        }
        if (expeditedDate.getDay() === 0) {
          expeditedDate.setDate(expeditedDate.getDate() + 1);
        }
        return expeditedDate;

      case 'STANDARD':
      default:
        // 2 business days
        const standardDate = new Date(now);
        let businessDaysAdded = 0;
        while (businessDaysAdded < 2) {
          standardDate.setDate(standardDate.getDate() + 1);
          if (standardDate.getDay() !== 0 && standardDate.getDay() !== 6) {
            businessDaysAdded++;
          }
        }
        return standardDate;
    }
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

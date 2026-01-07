import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateOrderDto, MarkOrderPaidDto } from './dto/create-order.dto';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  /**
   * Create a new order with compliance acknowledgment
   * All compliance checkboxes must be true per GUARDRAILS.md
   */
  async createOrder(dto: CreateOrderDto, userId: string, ipAddress: string) {
    // Validate all compliance checks are true
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

    // Calculate totals
    const subtotal = dto.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    const tax = subtotal * 0.08; // 8% tax (adjust as needed)
    const shippingCost = 15.0; // Flat rate (or calculate based on weight/location)
    const total = subtotal + tax + shippingCost;

    // Create addresses
    const shippingAddress = await this.prisma.address.create({
      data: dto.shippingAddress,
    });

    const billingAddress = await this.prisma.address.create({
      data: dto.billingAddress,
    });

    // Create order with DRAFT status
    const order = await this.prisma.order.create({
      data: {
        userId,
        accountType: 'RETAIL', // Default to RETAIL for now
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

    // Create compliance acknowledgment
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

    // Update order status to PENDING_PAYMENT
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

    // Send invoice email with payment instructions
    try {
      await this.notificationService.sendInvoiceEmail(updatedOrder as any);
    } catch (error) {
      // Log error but don't fail the order creation
      console.error('Failed to send invoice email:', error);
    }

    return updatedOrder;
  }

  /**
   * Mark an order as paid (admin only)
   */
  async markOrderPaid(
    orderId: string,
    dto: MarkOrderPaidDto,
    adminId: string
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.status !== 'PENDING_PAYMENT') {
      throw new BadRequestException(
        'Order is not in PENDING_PAYMENT status'
      );
    }

    // Create payment record
    const payment = await this.prisma.payment.create({
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

    // Update order status to PAID
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

    return updatedOrder;
  }

  /**
   * Get order by ID
   */
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

  /**
   * Get all orders for a user
   */
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

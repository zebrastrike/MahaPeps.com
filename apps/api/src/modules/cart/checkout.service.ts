import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailTemplatesService } from '../notifications/email-templates.service';
import { randomBytes } from 'crypto';

interface CheckoutDto {
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  selectedShippingRate?: {
    provider: string;
    serviceName: string;
    amount: string;
  };
  compliance: {
    researchPurposeOnly: boolean;
    responsibilityAccepted: boolean;
    noMedicalAdvice: boolean;
    ageConfirmation: boolean;
    termsAccepted: boolean;
  };
}

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly notifications: NotificationsService,
    private readonly emailTemplates: EmailTemplatesService,
  ) {}

  /**
   * Convert draft order (cart) to pending payment order
   * Creates compliance acknowledgment and payment link
   */
  async checkout(userId: string, dto: CheckoutDto, ipAddress: string, userAgent?: string) {
    // Validate all compliance checkboxes are TRUE
    if (
      !dto.compliance.researchPurposeOnly ||
      !dto.compliance.responsibilityAccepted ||
      !dto.compliance.noMedicalAdvice ||
      !dto.compliance.ageConfirmation ||
      !dto.compliance.termsAccepted
    ) {
      throw new BadRequestException(
        'All compliance acknowledgments must be accepted before checkout',
      );
    }

    // Get draft order (cart)
    const cart = await this.prisma.order.findFirst({
      where: {
        userId,
        status: OrderStatus.DRAFT,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Validate cart total is > 0
    if (cart.total.lte(0)) {
      throw new BadRequestException('Cart total must be greater than 0');
    }

    // Create shipping address (encrypted PII)
    const shippingAddress = await this.prisma.address.create({
      data: dto.shippingAddress,
    });

    // Create billing address (encrypted PII)
    const billingAddress = await this.prisma.address.create({
      data: dto.billingAddress,
    });

    // Calculate final shipping cost
    const shippingCost = dto.selectedShippingRate
      ? new Prisma.Decimal(dto.selectedShippingRate.amount)
      : new Prisma.Decimal(15.00); // Fallback if no rate selected

    // TODO: Calculate tax based on shipping address (Avalara/TaxJar integration)
    const tax = new Prisma.Decimal(0);

    // Recalculate total with final shipping
    const total = cart.subtotal.add(tax).add(shippingCost);

    // Update order with addresses, shipping, and transition to PENDING_PAYMENT
    const order = await this.prisma.order.update({
      where: { id: cart.id },
      data: {
        status: OrderStatus.PENDING_PAYMENT,
        shippingAddressId: shippingAddress.id,
        billingAddressId: billingAddress.id,
        shipping: shippingCost,
        tax,
        total,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
        user: true,
      },
    });

    // Create compliance acknowledgment
    await this.prisma.complianceAcknowledgment.create({
      data: {
        orderId: order.id,
        userId,
        researchPurposeOnly: dto.compliance.researchPurposeOnly,
        responsibilityAccepted: dto.compliance.responsibilityAccepted,
        noMedicalAdvice: dto.compliance.noMedicalAdvice,
        ageConfirmation: dto.compliance.ageConfirmation,
        termsAccepted: dto.compliance.termsAccepted,
        ipAddress,
        userAgent,
      },
    });

    // Generate unique payment link token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 72); // 72-hour expiration

    // Create payment link
    const paymentLink = await this.prisma.paymentLink.create({
      data: {
        orderId: order.id,
        token,
        amount: order.total,
        currency: 'USD',
        status: 'PENDING',
        expiresAt,
      },
    });

    // Audit log
    await this.audit.log({
      userId,
      action: 'ORDER_CHECKOUT',
      entityType: 'Order',
      entityId: order.id,
      metadata: {
        itemCount: order.items.length,
        total: order.total.toString(),
        paymentLinkId: paymentLink.id,
      },
      ipAddress,
      userAgent,
    });

    // Send payment instructions email
    try {
      const emailTemplate = this.emailTemplates.getPaymentInstructionsEmail({
        orderId: order.id,
        customerEmail: order.user.email,
        customerName: order.user.name,
        orderTotal: order.total.toString(),
        paymentToken: paymentLink.token,
        items: order.items.map((item) => ({
          productName: item.product?.name || 'Product',
          quantity: parseFloat(item.quantity.toString()),
          unitPrice: item.unitPrice.toString(),
          lineTotal: item.lineTotal.toString(),
        })),
        subtotal: order.subtotal.toString(),
        shipping: order.shipping.toString(),
        tax: order.tax.toString(),
      });

      await this.notifications.sendEmail({
        to: order.user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
    } catch (error) {
      // Log but don't fail checkout if email fails
      console.error('Failed to send payment instructions email:', error);
    }

    return {
      order: this.formatOrder(order),
      paymentLink: {
        id: paymentLink.id,
        token: paymentLink.token,
        url: `/payment/${paymentLink.token}`,
        expiresAt: paymentLink.expiresAt,
      },
    };
  }

  /**
   * Get order by payment link token
   */
  async getOrderByPaymentToken(token: string) {
    const paymentLink = await this.prisma.paymentLink.findUnique({
      where: { token },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!paymentLink) {
      throw new NotFoundException('Payment link not found');
    }

    if (paymentLink.status === 'EXPIRED' || paymentLink.expiresAt < new Date()) {
      throw new BadRequestException('Payment link has expired');
    }

    if (paymentLink.status === 'PAID') {
      throw new BadRequestException('Payment already completed');
    }

    return {
      paymentLink: {
        id: paymentLink.id,
        status: paymentLink.status,
        amount: parseFloat(paymentLink.amount.toString()),
        currency: paymentLink.currency,
        expiresAt: paymentLink.expiresAt,
      },
      order: this.formatOrder(paymentLink.order),
    };
  }

  private formatOrder(order: any) {
    return {
      id: order.id,
      status: order.status,
      accountType: order.accountType,
      items: order.items?.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name,
        quantity: parseFloat(item.quantity.toString()),
        unitPrice: parseFloat(item.unitPrice.toString()),
        lineTotal: parseFloat(item.lineTotal.toString()),
        metadata: item.metadata,
      })),
      subtotal: parseFloat(order.subtotal.toString()),
      tax: parseFloat(order.tax.toString()),
      shipping: parseFloat(order.shipping.toString()),
      total: parseFloat(order.total.toString()),
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}

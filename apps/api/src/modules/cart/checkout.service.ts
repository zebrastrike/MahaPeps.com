import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailTemplatesService } from '../notifications/email-templates.service';
import { randomBytes } from 'crypto';

// Flat rate shipping tier pricing
const SHIPPING_TIER_PRICES: Record<string, number> = {
  standard: 15,
  priority: 25,
  express: 45,
};

// Processing fee pricing
const PROCESSING_FEES: Record<string, number> = {
  STANDARD: 0,
  EXPEDITED: 25,
  RUSH: 50,
};

interface CheckoutDto {
  firstName: string;
  lastName: string;
  email: string; // Email for payment invoice
  phone?: string;
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
  shippingTier: 'standard' | 'priority' | 'express';
  shippingCost: number;
  orderInsurance?: boolean;
  processingType?: 'STANDARD' | 'EXPEDITED' | 'RUSH';
  termsAccepted: boolean;
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
    // Validate firstName, lastName, and email
    if (!dto.firstName || !dto.lastName) {
      throw new BadRequestException('First name and last name are required');
    }

    if (!dto.email) {
      throw new BadRequestException('Email address is required for payment invoice');
    }

    // Validate terms accepted
    if (!dto.termsAccepted) {
      throw new BadRequestException(
        'You must accept the Terms of Service to complete checkout',
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

    // Calculate shipping cost from flat rate tier (validate against server-side pricing)
    const serverShippingPrice = SHIPPING_TIER_PRICES[dto.shippingTier] || 15;
    const shippingCost = new Prisma.Decimal(serverShippingPrice);

    // Calculate processing fee
    const processingType = dto.processingType || 'STANDARD';
    const processingFee = new Prisma.Decimal(PROCESSING_FEES[processingType] || 0);

    // Calculate insurance fee (2% of subtotal, min $2, max $50)
    let insuranceFee = new Prisma.Decimal(0);
    if (dto.orderInsurance) {
      const subtotalNum = parseFloat(cart.subtotal.toString());
      const insuranceAmount = Math.max(2, Math.min(50, subtotalNum * 0.02));
      insuranceFee = new Prisma.Decimal(insuranceAmount);
    }

    // TODO: Calculate tax based on shipping address (Avalara/TaxJar integration)
    const tax = new Prisma.Decimal(0);

    // Recalculate total with shipping + processing + insurance
    const total = cart.subtotal.add(tax).add(shippingCost).add(processingFee).add(insuranceFee);

    // Update user with firstName, lastName, phone if provided
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        ...(dto.phone && { phone: dto.phone }),
      },
    });

    // Generate order number (MP-YYYY-NNNNN format)
    const year = new Date().getFullYear();
    const orderCount = await this.prisma.order.count({
      where: {
        status: { not: OrderStatus.DRAFT },
      },
    });
    const orderNumber = `MP-${year}-${String(orderCount + 1).padStart(5, '0')}`;

    // Update order with addresses, shipping, processing, customer info, and transition to PENDING_PAYMENT
    // Use email from checkout form (allows customer to specify different email for invoice)
    const order = await this.prisma.order.update({
      where: { id: cart.id },
      data: {
        status: OrderStatus.PENDING_PAYMENT,
        orderNumber,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
        email: dto.email,
        shippingAddressId: shippingAddress.id,
        billingAddressId: billingAddress.id,
        shipping: shippingCost,
        processingType: processingType as any,
        processingFee,
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
    // When user accepts terms, they acknowledge all compliance requirements
    await this.prisma.complianceAcknowledgment.create({
      data: {
        orderId: order.id,
        userId,
        researchPurposeOnly: dto.termsAccepted,
        responsibilityAccepted: dto.termsAccepted,
        noMedicalAdvice: dto.termsAccepted,
        ageConfirmation: dto.termsAccepted,
        termsAccepted: dto.termsAccepted,
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
        customerEmail: order.email,
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
      // Build customer name from order firstName/lastName or fallback to email
      const customerName = order.firstName && order.lastName
        ? `${order.firstName} ${order.lastName}`
        : order.email.split('@')[0];

      const emailTemplate = this.emailTemplates.getPaymentInstructionsEmail({
        orderId: order.id,
        customerEmail: order.email,
        customerName,
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

      // Send to email from checkout form (allows different from account email)
      await this.notifications.sendEmail({
        to: order.email,
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
      orderNumber: order.orderNumber,
      status: order.status,
      accountType: order.accountType,
      firstName: order.firstName,
      lastName: order.lastName,
      phone: order.phone,
      email: order.email,
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

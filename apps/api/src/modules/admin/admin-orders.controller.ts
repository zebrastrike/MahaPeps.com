import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { ShippoService } from '../orders/shippo.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailTemplatesService } from '../notifications/email-templates.service';

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminOrdersController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly shippo: ShippoService,
    private readonly notifications: NotificationsService,
    private readonly emailTemplates: EmailTemplatesService,
  ) {}

  /**
   * List all orders with filters
   * GET /api/admin/orders?status=PAID&accountType=CLINIC&limit=50&offset=0
   */
  @Get()
  async listOrders(
    @Query('status') status?: string,
    @Query('accountType') accountType?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (accountType) {
      where.accountType = accountType;
    }

    const take = limit ? parseInt(limit, 10) : 50;
    const skip = offset ? parseInt(offset, 10) : 0;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          shippingAddress: true,
          billingAddress: true,
          shipments: {
            select: {
              id: true,
              trackingNumber: true,
              carrier: true,
              createdAt: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take,
        skip,
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      orders,
      total,
      limit: take,
      offset: skip,
    };
  }

  /**
   * Get single order with full details
   * GET /api/admin/orders/:orderId
   */
  @Get(':orderId')
  async getOrder(@Param('orderId') orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
        items: {
          include: {
            product: true,
            variant: true,
            batch: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
        shipments: {
          include: {
            order: false,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        paymentLink: {
          include: {
            paymentProof: true,
          },
        },
      },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    return order;
  }

  /**
   * Create shipment and generate shipping label
   * POST /api/admin/orders/:orderId/create-shipment
   */
  @Post(':orderId/create-shipment')
  async createShipment(
    @Param('orderId') orderId: string,
    @Body() body: { carrier: 'USPS' | 'FedEx' | 'UPS'; service: 'PRIORITY' | 'EXPRESS' | 'GROUND' },
  ) {
    // Fetch order with all required relations
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        shippingAddress: true,
      },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    if (order.status !== 'PAID') {
      throw new BadRequestException('Order must be in PAID status to create shipment');
    }

    if (!order.shippingAddress) {
      throw new BadRequestException('Order has no shipping address');
    }

    // Create shipment via Shippo
    const shipmentResult = await this.shippo.createShipment({
      orderId: order.id,
      carrier: body.carrier,
      service: body.service,
      customerName: order.user.name || order.user.email,
      shippingAddress: {
        line1: order.shippingAddress.line1,
        line2: order.shippingAddress.line2 || undefined,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        postalCode: order.shippingAddress.postalCode,
        country: order.shippingAddress.country,
      },
    });

    // Send shipping confirmation email
    try {
      const emailTemplate = this.emailTemplates.getShippingConfirmationEmail({
        orderId: order.id,
        trackingNumber: shipmentResult.trackingNumber!,
        carrier: body.carrier,
        estimatedDelivery: shipmentResult.estimatedDelivery
          ? new Date(shipmentResult.estimatedDelivery).toLocaleDateString()
          : undefined,
      });

      await this.notifications.sendEmail({
        to: order.user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
    } catch (emailError: any) {
      // Log email error but don't fail the shipment creation
      console.error('Failed to send shipping email:', emailError.message);
    }

    return {
      success: true,
      shipmentId: shipmentResult.shipmentId,
      trackingNumber: shipmentResult.trackingNumber,
      labelUrl: shipmentResult.labelUrl,
      carrier: shipmentResult.carrier,
      service: shipmentResult.service,
      estimatedDelivery: shipmentResult.estimatedDelivery,
    };
  }
}

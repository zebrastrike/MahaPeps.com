import { Body, Controller, Post, Headers, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EmailTemplatesService } from '../notifications/email-templates.service';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly emailTemplatesService: EmailTemplatesService,
  ) {}

  /**
   * Shippo webhook endpoint
   * Handles events: track_updated, transaction_created
   */
  @Post('shippo')
  async handleShippoWebhook(
    @Body() body: any,
    @Headers('x-shippo-signature') signature: string,
  ) {
    this.logger.log(`Received Shippo webhook: ${body.event}`);

    // Verify webhook signature if secret is configured
    if (process.env.SHIPPO_WEBHOOK_SECRET) {
      // TODO: Implement signature verification
      // For now, log a warning
      this.logger.warn('Webhook signature verification not implemented');
    }

    try {
      // Handle different event types
      switch (body.event) {
        case 'transaction_created':
          await this.handleTransactionCreated(body.data);
          break;

        case 'track_updated':
          await this.handleTrackUpdated(body.data);
          break;

        default:
          this.logger.log(`Unhandled event type: ${body.event}`);
      }

      return { received: true };
    } catch (error: any) {
      this.logger.error(`Webhook processing failed: ${error.message}`, error.stack);
      throw new BadRequestException(`Webhook processing failed: ${error.message}`);
    }
  }

  /**
   * Handle transaction_created event (label purchased)
   */
  private async handleTransactionCreated(data: any) {
    const trackingNumber = data.tracking_number;
    const labelUrl = data.label_url;
    const carrier = data.carrier || 'USPS';
    const eta = data.eta;

    if (!trackingNumber) {
      this.logger.warn('Transaction created without tracking number');
      return;
    }

    this.logger.log(`Label purchased: ${trackingNumber} (${carrier})`);

    // Find the shipment in our database by Shippo transaction ID
    const shipment = await this.prisma.shipment.findFirst({
      where: { shippoId: data.object_id },
      include: {
        order: {
          include: {
            user: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!shipment) {
      // If shipment doesn't exist, try to find by tracking number or create new
      this.logger.warn(`Shipment not found for Shippo ID: ${data.object_id}`);

      // Try to find order by metadata
      const order = await this.prisma.order.findFirst({
        where: {
          metadata: {
            path: ['shippoOrderId'],
            equals: data.order,
          },
        },
        include: {
          user: true,
        },
      });

      if (order) {
        // Create shipment record
        await this.prisma.shipment.create({
          data: {
            orderId: order.id,
            carrier,
            service: 'STANDARD',
            trackingNumber,
            labelUrl,
            shippoId: data.object_id,
            estimatedDelivery: eta ? new Date(eta) : undefined,
          },
        });

        // Update order status to SHIPPED
        await this.prisma.order.update({
          where: { id: order.id },
          data: { status: 'SHIPPED' },
        });

        // Send tracking email
        await this.sendTrackingEmail(order, trackingNumber, carrier, eta);
      }
      return;
    }

    // Send tracking email to customer
    await this.sendTrackingEmail(shipment.order, trackingNumber, carrier, eta);
  }

  /**
   * Handle track_updated event (tracking status changed)
   */
  private async handleTrackUpdated(data: any) {
    const trackingNumber = data.tracking_number;
    const status = data.tracking_status?.status;
    const statusDetails = data.tracking_status?.status_details;

    this.logger.log(`Tracking updated: ${trackingNumber} - ${status}`);

    // Update shipment in database
    const shipment = await this.prisma.shipment.findFirst({
      where: { trackingNumber },
    });

    if (shipment) {
      await this.prisma.shipment.update({
        where: { id: shipment.id },
        data: {
          metadata: {
            lastTrackingStatus: status,
            lastTrackingUpdate: new Date().toISOString(),
            statusDetails,
          },
        },
      });

      // If delivered, optionally send delivery confirmation email
      if (status === 'DELIVERED') {
        this.logger.log(`Order delivered: ${shipment.orderId}`);
        // TODO: Send delivery confirmation email if desired
      }
    }
  }

  /**
   * Send tracking email to customer
   */
  private async sendTrackingEmail(
    order: any,
    trackingNumber: string,
    carrier: string,
    eta?: string,
  ) {
    try {
      const { subject, html } = this.emailTemplatesService.getShippingConfirmationEmail({
        orderId: order.id,
        trackingNumber,
        carrier,
        estimatedDelivery: eta ? new Date(eta).toLocaleDateString() : undefined,
      });

      await this.notificationsService.sendEmail({
        to: order.user.email,
        subject,
        html,
      });

      this.logger.log(`Tracking email sent to ${order.user.email} for order ${order.id}`);
    } catch (error: any) {
      this.logger.error(`Failed to send tracking email: ${error.message}`, error.stack);
      // Don't throw - webhook should still succeed
    }
  }
}

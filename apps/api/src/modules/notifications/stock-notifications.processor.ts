import { Injectable, Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from './notifications.service';
import { StockStatus } from '@prisma/client';

interface StockNotificationJob {
  productId: string;
}

@Injectable()
@Processor('stock-notifications')
export class StockNotificationsProcessor {
  private readonly logger = new Logger(StockNotificationsProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Process('product-back-in-stock')
  async handleBackInStock(job: Job<StockNotificationJob>) {
    const { productId } = job.data;

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, isActive: true, stockStatus: true },
    });

    if (!product || !product.isActive) {
      this.logger.warn(`Product ${productId} not found or inactive`);
      return;
    }

    if (product.stockStatus === StockStatus.OUT_OF_STOCK) {
      this.logger.warn(`Product ${productId} still out of stock`);
      return;
    }

    const notifications = await this.prisma.stockNotification.findMany({
      where: {
        productId,
        notified: false,
      },
    });

    if (notifications.length === 0) {
      return;
    }

    const productUrl = `${process.env.FRONTEND_URL || ''}/products/${product.id}`;

    for (const notification of notifications) {
      try {
        await this.notificationsService.sendBackInStockEmail({
          to: notification.email,
          productName: product.name,
          productUrl,
        });

        await this.prisma.stockNotification.update({
          where: { id: notification.id },
          data: { notified: true, notifiedAt: new Date() },
        });
      } catch (error: any) {
        this.logger.error(
          `Failed to send stock email for notification ${notification.id}: ${error?.message}`,
        );
      }
    }
  }
}

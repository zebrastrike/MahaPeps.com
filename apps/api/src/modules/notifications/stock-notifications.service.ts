import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Prisma, StockStatus } from '@prisma/client';
import { Queue } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StockNotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('stock-notifications') private readonly queue: Queue,
  ) {}

  async requestNotification(params: {
    productId: string;
    email: string;
    userId?: string;
  }) {
    const product = await this.prisma.product.findUnique({
      where: { id: params.productId },
      select: { id: true, name: true, isActive: true, stockStatus: true },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('Product not found');
    }

    if (product.stockStatus !== StockStatus.OUT_OF_STOCK) {
      return {
        status: 'in_stock',
        message: 'Product is currently available',
      };
    }

    try {
      const notification = await this.prisma.stockNotification.create({
        data: {
          productId: params.productId,
          email: params.email,
          userId: params.userId,
        },
      });

      return { status: 'queued', notificationId: notification.id };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return { status: 'already_requested' };
      }

      throw new BadRequestException('Unable to create notification request');
    }
  }

  async enqueueBackInStock(productId: string) {
    await this.queue.add(
      'product-back-in-stock',
      { productId },
      {
        jobId: `product-back-in-stock:${productId}`,
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  }
}

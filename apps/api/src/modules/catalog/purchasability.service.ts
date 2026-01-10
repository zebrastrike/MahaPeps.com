import { Injectable } from '@nestjs/common';
import { StockStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PurchasabilityService {
  constructor(private readonly prisma: PrismaService) {}

  async isVariantPurchasable(variantId: string): Promise<{
    purchasable: boolean;
    reason?: string;
    activeBatchId?: string;
  }> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: true,
        batches: {
          where: {
            isActive: true,
            isAvailable: true,
            coaFileId: { not: null },
          },
          take: 1,
        },
      },
    });

    if (!variant) {
      return { purchasable: false, reason: 'Variant not found' };
    }

    if (!variant.product?.isActive || !variant.isActive) {
      return { purchasable: false, reason: 'Variant not active' };
    }

    if (
      variant.product.stockStatus === StockStatus.OUT_OF_STOCK ||
      variant.product.stockStatus === StockStatus.DISCONTINUED
    ) {
      return { purchasable: false, reason: 'Product not available' };
    }

    const activeBatch = variant.batches[0];

    if (!activeBatch) {
      return { purchasable: false, reason: 'No active batch with COA' };
    }

    if (activeBatch.expiresAt && activeBatch.expiresAt < new Date()) {
      return { purchasable: false, reason: 'Batch expired' };
    }

    return {
      purchasable: true,
      activeBatchId: activeBatch.id,
    };
  }
}

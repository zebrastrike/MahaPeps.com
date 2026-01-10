import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, CatalogType, PriceTier, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CatalogVisibilityService } from './catalog-visibility.service';

@Injectable()
export class PricingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalogVisibility: CatalogVisibilityService,
  ) {}

  async calculatePrice(
    variantId: string,
    quantity: number,
    user?: User | null,
  ): Promise<{ price: Prisma.Decimal; tier: PriceTier | null; catalogType: CatalogType }> {
    if (quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    const catalogType = this.catalogVisibility.getCatalogType(user);

    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: {
        product: true,
        batches: {
          where: { isActive: true },
          take: 1,
        },
      },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    const activeBatch = variant.batches[0];
    let tier: PriceTier | null = null;

    if (activeBatch) {
      tier = await this.prisma.priceTier.findFirst({
        where: {
          batchId: activeBatch.id,
          catalogType,
          minQuantity: { lte: quantity },
          OR: [{ maxQuantity: { gte: quantity } }, { maxQuantity: null }],
          isActive: true,
        },
        orderBy: { minQuantity: 'desc' },
      });
    }

    if (!tier) {
      tier = await this.prisma.priceTier.findFirst({
        where: {
          productId: variant.productId,
          batchId: null,
          catalogType,
          minQuantity: { lte: quantity },
          OR: [{ maxQuantity: { gte: quantity } }, { maxQuantity: null }],
          isActive: true,
        },
        orderBy: { minQuantity: 'desc' },
      });
    }

    if (!tier && catalogType === CatalogType.B2B_ONLY) {
      tier = await this.prisma.priceTier.findFirst({
        where: {
          productId: variant.productId,
          batchId: null,
          catalogType: CatalogType.B2C_ONLY,
          minQuantity: { lte: quantity },
          OR: [{ maxQuantity: { gte: quantity } }, { maxQuantity: null }],
          isActive: true,
        },
        orderBy: { minQuantity: 'desc' },
      });
    }

    if (!tier) {
      throw new BadRequestException('Pricing not available for this quantity');
    }

    return {
      price: tier.price,
      tier,
      catalogType,
    };
  }

  async getPricingTiers(variantId: string, user?: User | null) {
    const catalogType = this.catalogVisibility.getCatalogType(user);
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { productId: true },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    const activeBatch = await this.prisma.productBatch.findFirst({
      where: { variantId, isActive: true },
      select: { id: true },
    });

    return this.prisma.priceTier.findMany({
      where: {
        OR: [
          { productId: variant.productId, batchId: null },
          ...(activeBatch ? [{ batchId: activeBatch.id }] : []),
        ],
        catalogType,
        isActive: true,
      },
      orderBy: { minQuantity: 'asc' },
    });
  }
}

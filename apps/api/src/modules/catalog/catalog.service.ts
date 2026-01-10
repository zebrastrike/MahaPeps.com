import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { name: string; description: string }) {
    return { ...data };
  }

  getHealth(): string {
    return 'catalog-ok';
  }

  async listProducts(limit: number = 200) {
    const safeLimit = this.clampNumber(limit, 1, 200);

    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      take: safeLimit,
      orderBy: { name: 'asc' },
      include: {
        variants: {
          where: { isActive: true },
          orderBy: { strengthValue: 'asc' },
          include: {
            batches: {
              where: { isActive: true, coaFileId: { not: null } },
              select: { id: true, purityPercent: true },
            },
          },
        },
      },
    });

    return products.map((product) => this.mapCatalogProduct(product));
  }

  async getProductBySlug(slugOrId: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        isActive: true,
        OR: [{ slug: slugOrId }, { id: slugOrId }],
      },
      include: {
        variants: {
          where: { isActive: true },
          orderBy: { strengthValue: 'asc' },
          include: {
            batches: {
              where: { isActive: true, coaFileId: { not: null } },
              select: { id: true, purityPercent: true },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return this.mapCatalogProductDetail(product);
  }

  private mapCatalogProduct(product: any) {
    const variants = (product.variants || []).map((variant: any) => {
      const hasCoa = (variant.batches || []).length > 0;
      return {
        id: variant.id,
        strengthValue: this.toNumber(variant.strengthValue),
        strengthUnit: variant.strengthUnit,
        sku: variant.sku,
        priceCents: variant.priceCents,
        isActive: variant.isActive,
        hasCoa,
        purchasable: product.isActive && variant.isActive && hasCoa,
      };
    });

    const purityValues: number[] = [];
    for (const variant of product.variants || []) {
      for (const batch of variant.batches || []) {
        purityValues.push(this.toNumber(batch.purityPercent));
      }
    }

    const purityPercent = purityValues.length
      ? Math.max(...purityValues)
      : null;

    const defaultVariant =
      variants.find((variant) => variant.purchasable) ||
      variants.find((variant) => variant.isActive) ||
      variants[0];

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      sku: product.sku,
      category: product.category,
      isActive: product.isActive,
      hasCoa: variants.some((variant) => variant.hasCoa),
      purityPercent,
      variants,
      defaultVariantId: defaultVariant ? defaultVariant.id : null,
    };
  }

  private mapCatalogProductDetail(product: any) {
    return {
      ...this.mapCatalogProduct(product),
      form: product.form,
      concentration: product.concentration,
      casNumber: product.casNumber,
      molecularFormula: product.molecularFormula,
    };
  }

  private toNumber(value: any): number {
    if (typeof value === 'number') return value;
    return Number(value);
  }

  private clampNumber(value: number, min: number, max: number): number {
    if (Number.isNaN(value)) return min;
    return Math.min(Math.max(value, min), max);
  }
}

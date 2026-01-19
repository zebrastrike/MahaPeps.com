import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FileStorageService } from '../files/file-storage.service';
import { CatalogVisibilityService } from './catalog-visibility.service';
import { PurchasabilityService } from './purchasability.service';
import { getCatalogPriceOverrideCents } from './catalog-overrides';
import { User } from '@prisma/client';

@Injectable()
export class CatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileStorage: FileStorageService,
    private readonly catalogVisibility: CatalogVisibilityService,
    private readonly purchasability: PurchasabilityService,
  ) {}

  getHealth(): string {
    return 'catalog-ok';
  }

  async listProducts(user?: User | null, limit: number = 200) {
    const safeLimit = this.clampNumber(limit, 1, 200);
    const visibleTypes = this.catalogVisibility.getVisibleProducts(user);
    const now = new Date();

    const products = await this.prisma.product.findMany({
      where: {
        visibility: { in: visibleTypes },
        isActive: true,
        isDraft: false,
      },
      take: safeLimit,
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
      include: {
        variants: {
          where: { isActive: true },
          orderBy: { strengthValue: 'asc' },
          include: {
            batches: {
              where: {
                isActive: true,
                isAvailable: true,
                // COA enforcement temporarily disabled
                // coaFileId: { not: null },
                // expiresAt: { gt: now },
              },
              take: 1,
              include: { coaFile: true },
            },
          },
        },
      },
    });

    return Promise.all(products.map((product) => this.mapCatalogProduct(product)));
  }

  async getProductBySlug(slugOrId: string, user?: User | null) {
    const visibleTypes = this.catalogVisibility.getVisibleProducts(user);
    const now = new Date();

    const product = await this.prisma.product.findFirst({
      where: {
        isActive: true,
        isDraft: false,
        visibility: { in: visibleTypes },
        OR: [{ slug: slugOrId }, { id: slugOrId }],
      },
      include: {
        variants: {
          where: { isActive: true },
          orderBy: { strengthValue: 'asc' },
          include: {
            batches: {
              where: {
                isActive: true,
                isAvailable: true,
                // COA enforcement temporarily disabled
                // coaFileId: { not: null },
                // expiresAt: { gt: now },
              },
              take: 1,
              include: { coaFile: true },
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

  private async mapCatalogProduct(product: any) {
    const variants = await Promise.all(
      (product.variants || []).map(async (variant: any) => {
        const activeBatch = (variant.batches || [])[0];
        const hasCoa = !!activeBatch?.coaFileId;
        const purchaseCheck = await this.purchasability.isVariantPurchasable(
          variant.id,
        );

        let coaDownloadUrl: string | null = null;
        if (activeBatch?.coaFileId) {
          coaDownloadUrl = await this.fileStorage.getSignedDownloadUrl(
            activeBatch.coaFileId,
            86400,
          );
        }

        const strengthValue = this.toNumber(variant.strengthValue);
        const overridePriceCents = getCatalogPriceOverrideCents({
          productSlug: product.slug,
          variantSku: variant.sku,
          strengthValue,
          strengthUnit: variant.strengthUnit,
        });
        const priceCents = overridePriceCents ?? variant.priceCents;

        return {
          id: variant.id,
          strengthValue,
          strengthUnit: variant.strengthUnit,
          sku: variant.sku,
          priceCents,
          isActive: variant.isActive,
          hasCoa,
          purchasable: purchaseCheck.purchasable,
          coaDownloadUrl,
        };
      }),
    );

    const purityValues: number[] = [];
    for (const variant of product.variants || []) {
      for (const batch of variant.batches || []) {
        if (batch.purityPercent !== null && batch.purityPercent !== undefined) {
          purityValues.push(this.toNumber(batch.purityPercent));
        }
      }
    }

    const purityPercent = purityValues.length ? Math.max(...purityValues) : null;

    const overrideDefaultVariant = variants.find(
      (variant) =>
        variant.isActive &&
        getCatalogPriceOverrideCents({
          productSlug: product.slug,
          variantSku: variant.sku,
          strengthValue: variant.strengthValue,
          strengthUnit: variant.strengthUnit,
        }) !== null,
    );

    const defaultVariant =
      overrideDefaultVariant ||
      variants.find((variant) => variant.purchasable) ||
      variants.find((variant) => variant.isActive) ||
      variants[0];

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      sku: product.sku,
      imageUrl: product.imageUrl,
      category: product.category,
      isActive: product.isActive,
      stockStatus: product.stockStatus,
      expectedRestockDate: product.expectedRestockDate,
      hasCoa: variants.some((variant) => variant.hasCoa),
      purityPercent,
      variants,
      defaultVariantId: defaultVariant ? defaultVariant.id : null,
    };
  }

  private async mapCatalogProductDetail(product: any) {
    const base = await this.mapCatalogProduct(product);
    return {
      ...base,
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

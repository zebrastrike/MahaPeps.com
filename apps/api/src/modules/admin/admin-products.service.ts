import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductVisibility, StockStatus, StrengthUnit, User } from '@prisma/client';
import { AuditService } from '../../audit/audit.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BatchesService } from '../batches/batches.service';
import { StockNotificationsService } from '../notifications/stock-notifications.service';

interface ProductListFilters {
  q?: string;
  category?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

interface BulkUpdateInput {
  productIds?: string[];
  variantIds?: string[];
  isActive?: boolean | string;
  variantActive?: boolean | string;
  priceCents?: number | string | null;
  setPricingOnRequest?: boolean;
}

interface CreateProductInput {
  name: string;
  sku: string;
  description?: string;
  category?: string;
  form?: string;
  concentration?: string;
  casNumber?: string;
  molecularFormula?: string;
  isActive?: boolean | string;
  slug?: string;
  visibility?: string;
  stockStatus?: string;
  currentStock?: number | string;
  expectedRestockDate?: string;
}

interface UpdateProductInput {
  name?: string;
  sku?: string;
  description?: string | null;
  category?: string | null;
  form?: string | null;
  concentration?: string | null;
  casNumber?: string | null;
  molecularFormula?: string | null;
  isActive?: boolean | string;
  slug?: string | null;
  visibility?: string | null;
  stockStatus?: string | null;
  currentStock?: number | string | null;
  expectedRestockDate?: string | null;
}

interface CreateVariantInput {
  strengthValue: number | string;
  strengthUnit: string;
  sku: string;
  priceCents?: number | string | null;
  isActive?: boolean | string;
}

interface UpdateVariantInput {
  strengthValue?: number | string;
  strengthUnit?: string;
  sku?: string;
  priceCents?: number | string | null;
  isActive?: boolean | string;
  setPricingOnRequest?: boolean;
}

interface CreateBatchInput {
  batchCode: string;
  purityPercent: number | string;
  manufacturedAt: string;
  expiresAt: string;
  qtyInitial: number | string;
  qtyAvailable: number | string;
  storageInstructions?: string | null;
  testingLab?: string | null;
}

interface UploadCoaInput {
  purityPercent?: number | string;
  testingLab?: string;
}

@Injectable()
export class AdminProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly batchesService: BatchesService,
    private readonly auditService: AuditService,
    private readonly stockNotifications: StockNotificationsService,
  ) {}

  async listProducts(filters: ProductListFilters) {
    const limit = this.clampNumber(filters.limit ?? 50, 1, 200);
    const offset = Math.max(filters.offset ?? 0, 0);

    const where: Prisma.ProductWhereInput = {};

    if (filters.q) {
      where.OR = [
        { name: { contains: filters.q, mode: 'insensitive' } },
        { sku: { contains: filters.q, mode: 'insensitive' } },
        { description: { contains: filters.q, mode: 'insensitive' } },
        { slug: { contains: filters.q, mode: 'insensitive' } },
      ];
    }

    if (filters.category) {
      where.category = filters.category as any;
    }

    if (typeof filters.isActive === 'boolean') {
      where.isActive = filters.isActive;
    }

    const now = new Date();

    const [total, products] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
        include: {
          variants: {
            include: {
              batches: {
                where: {
                  isActive: true,
                  coaFileId: { not: null },
                  isAvailable: true,
                  expiresAt: { gt: now },
                },
                select: { id: true },
              },
            },
            orderBy: { strengthValue: 'asc' },
          },
        },
      }),
    ]);

    return {
      total,
      limit,
      offset,
      items: products.map((product) => this.mapAdminProductSummary(product)),
    };
  }

  async getProductById(productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          include: {
            batches: {
              orderBy: { manufacturedAt: 'desc' },
              include: {
                coaFile: true,
              },
            },
          },
          orderBy: { strengthValue: 'asc' },
        },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    return this.mapAdminProductDetail(product);
  }

  async createProduct(input: unknown, actor: User) {
    const payload = input as CreateProductInput;

    if (!payload?.name) {
      throw new BadRequestException('name is required');
    }

    if (!payload?.sku) {
      throw new BadRequestException('sku is required');
    }

    const slug = await this.ensureUniqueSlug(
      this.normalizeSlug(payload.slug || payload.name),
    );

    const data: Prisma.ProductCreateInput = {
      name: payload.name,
      slug,
      sku: payload.sku,
      description: payload.description ?? null,
      form: payload.form ?? null,
      concentration: payload.concentration ?? null,
      casNumber: payload.casNumber ?? null,
      molecularFormula: payload.molecularFormula ?? null,
      isActive: this.parseOptionalBoolean(payload.isActive) ?? true,
      isDraft: false,
    };

    if (payload.category) {
      data.category = payload.category as any;
    }

    const visibility = this.parseVisibility(payload.visibility);
    if (visibility) {
      data.visibility = visibility;
    }

    const stockStatus = this.parseStockStatus(payload.stockStatus);
    if (stockStatus) {
      data.stockStatus = stockStatus;
    }

    if (payload.currentStock !== undefined) {
      data.currentStock = this.parseNumber(payload.currentStock, 'currentStock');
    }

    if (payload.expectedRestockDate) {
      data.expectedRestockDate = this.parseDate(
        payload.expectedRestockDate,
        'expectedRestockDate',
      );
    }

    const product = await this.prisma.product.create({ data });

    await this.logAudit('PRODUCT_CREATE', actor, {
      productId: product.id,
      sku: product.sku,
    });

    return product;
  }

  async updateProduct(productId: string, input: unknown, actor: User) {
    const payload = input as UpdateProductInput;

    const existing = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existing) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    const data: Prisma.ProductUpdateInput = {};
    const previousStockStatus = existing.stockStatus;
    const previousStock = existing.currentStock ?? 0;

    if (payload.name !== undefined) {
      data.name = payload.name ?? existing.name;
    }

    if (payload.sku !== undefined) {
      data.sku = payload.sku ?? existing.sku;
    }

    if (payload.description !== undefined) {
      data.description = payload.description;
    }

    if (payload.category !== undefined) {
      data.category = payload.category as any;
    }

    if (payload.form !== undefined) {
      data.form = payload.form;
    }

    if (payload.concentration !== undefined) {
      data.concentration = payload.concentration;
    }

    if (payload.casNumber !== undefined) {
      data.casNumber = payload.casNumber;
    }

    if (payload.molecularFormula !== undefined) {
      data.molecularFormula = payload.molecularFormula;
    }

    const isActive = this.parseOptionalBoolean(payload.isActive);
    if (isActive !== undefined) {
      data.isActive = isActive;
    }

    if (payload.slug !== undefined) {
      const slugBase = payload.slug || payload.name || existing.name;
      data.slug = await this.ensureUniqueSlug(
        this.normalizeSlug(slugBase),
        productId,
      );
    }

    if (payload.visibility !== undefined) {
      data.visibility = payload.visibility
        ? this.parseVisibility(payload.visibility)
        : null;
    }

    if (payload.stockStatus !== undefined) {
      data.stockStatus = payload.stockStatus
        ? this.parseStockStatus(payload.stockStatus)
        : null;
    }

    if (payload.currentStock !== undefined) {
      data.currentStock =
        payload.currentStock === null
          ? null
          : this.parseNumber(payload.currentStock, 'currentStock');
    }

    if (payload.expectedRestockDate !== undefined) {
      data.expectedRestockDate = payload.expectedRestockDate
        ? this.parseDate(payload.expectedRestockDate, 'expectedRestockDate')
        : null;
    }

    const updated = await this.prisma.product.update({
      where: { id: productId },
      data,
    });

    await this.logAudit('PRODUCT_UPDATE', actor, {
      productId,
      sku: updated.sku,
    });

    const stockNow = updated.currentStock ?? 0;
    const stockStatus = updated.stockStatus;
    const becameAvailable =
      (previousStockStatus === StockStatus.OUT_OF_STOCK &&
        stockStatus &&
        stockStatus !== StockStatus.OUT_OF_STOCK) ||
      (previousStock <= 0 && stockNow > 0);

    if (becameAvailable && updated.isActive) {
      await this.stockNotifications.enqueueBackInStock(updated.id);
    }

    return updated;
  }

  async bulkUpdate(input: unknown, actor: User) {
    const payload = input as BulkUpdateInput;

    const productIds = Array.isArray(payload.productIds)
      ? payload.productIds
      : [];
    const variantIds = Array.isArray(payload.variantIds)
      ? payload.variantIds
      : [];

    if (productIds.length === 0 && variantIds.length === 0) {
      throw new BadRequestException('No productIds or variantIds provided');
    }

    const isActive = this.parseOptionalBoolean(payload.isActive);
    const variantActive = this.parseOptionalBoolean(payload.variantActive);
    const setPricingOnRequest = payload.setPricingOnRequest === true;

    let productCount = 0;
    let variantCount = 0;

    if (productIds.length > 0 && isActive !== undefined) {
      const result = await this.prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: { isActive },
      });
      productCount = result.count;
    }

    if (
      variantIds.length > 0 &&
      (variantActive !== undefined ||
        payload.priceCents !== undefined ||
        setPricingOnRequest)
    ) {
      const data: Prisma.ProductVariantUpdateManyMutationInput = {};

      if (variantActive !== undefined) {
        data.isActive = variantActive;
      }

      if (setPricingOnRequest) {
        data.priceCents = null;
      } else if (payload.priceCents !== undefined) {
        data.priceCents = this.parsePriceCents(payload.priceCents);
      }

      if (Object.keys(data).length > 0) {
        const result = await this.prisma.productVariant.updateMany({
          where: { id: { in: variantIds } },
          data,
        });
        variantCount = result.count;
      }
    }

    await this.logAudit('PRODUCT_BULK_UPDATE', actor, {
      productIds,
      variantIds,
      updatedProducts: productCount,
      updatedVariants: variantCount,
      isActive,
      variantActive,
      setPricingOnRequest,
      priceCents: payload.priceCents ?? null,
    });

    return { updatedProducts: productCount, updatedVariants: variantCount };
  }

  async createVariant(productId: string, input: unknown, actor: User) {
    const payload = input as CreateVariantInput;

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    if (!payload?.sku) {
      throw new BadRequestException('sku is required');
    }

    const variant = await this.prisma.productVariant.create({
      data: {
        productId,
        strengthValue: this.parseNumber(payload.strengthValue, 'strengthValue'),
        strengthUnit: this.normalizeStrengthUnit(payload.strengthUnit),
        sku: payload.sku,
        priceCents: this.parsePriceCents(payload.priceCents),
        isActive: this.parseOptionalBoolean(payload.isActive) ?? true,
      },
    });

    await this.logAudit('VARIANT_CREATE', actor, {
      productId,
      variantId: variant.id,
      sku: variant.sku,
    });

    return variant;
  }

  async updateVariant(variantId: string, input: unknown, actor: User) {
    const payload = input as UpdateVariantInput;

    const existing = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!existing) {
      throw new NotFoundException(`Variant ${variantId} not found`);
    }

    const data: Prisma.ProductVariantUpdateInput = {};

    if (payload.strengthValue !== undefined) {
      data.strengthValue = this.parseNumber(
        payload.strengthValue,
        'strengthValue',
      );
    }

    if (payload.strengthUnit !== undefined) {
      data.strengthUnit = this.normalizeStrengthUnit(payload.strengthUnit);
    }

    if (payload.sku !== undefined) {
      data.sku = payload.sku;
    }

    if (payload.setPricingOnRequest) {
      data.priceCents = null;
    } else if (payload.priceCents !== undefined) {
      data.priceCents = this.parsePriceCents(payload.priceCents);
    }

    const isActive = this.parseOptionalBoolean(payload.isActive);
    if (isActive !== undefined) {
      data.isActive = isActive;
    }

    const updated = await this.prisma.productVariant.update({
      where: { id: variantId },
      data,
    });

    await this.logAudit('VARIANT_UPDATE', actor, {
      variantId,
      sku: updated.sku,
    });

    return updated;
  }

  async createBatch(variantId: string, input: unknown, actor: User) {
    const payload = input as CreateBatchInput;

    if (!payload?.batchCode) {
      throw new BadRequestException('batchCode is required');
    }

    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { id: true, productId: true },
    });

    if (!variant) {
      throw new NotFoundException(`Variant ${variantId} not found`);
    }

    const manufacturedAt = this.parseDate(payload.manufacturedAt, 'manufacturedAt');
    const expiresAt = this.parseDate(payload.expiresAt, 'expiresAt');

    const batch = await this.prisma.productBatch.create({
      data: {
        productId: variant.productId,
        variantId,
        batchCode: payload.batchCode,
        purityPercent: this.parseNumber(payload.purityPercent, 'purityPercent'),
        manufacturedAt,
        expiresAt,
        qtyInitial: this.parseNumber(payload.qtyInitial, 'qtyInitial'),
        qtyAvailable: this.parseNumber(payload.qtyAvailable, 'qtyAvailable'),
        storageInstructions: payload.storageInstructions ?? null,
        testingLab: payload.testingLab ?? null,
        isActive: false,
        isAvailable: true,
      },
    });

    await this.logAudit('BATCH_CREATE', actor, {
      variantId,
      batchId: batch.id,
      batchCode: batch.batchCode,
    });

    return batch;
  }

  async uploadCoa(
    batchId: string,
    file: Express.Multer.File,
    input: unknown,
    actor: User,
  ) {
    const payload = input as UploadCoaInput;
    const purityPercent =
      payload?.purityPercent !== undefined
        ? this.parseNumber(payload.purityPercent, 'purityPercent')
        : undefined;

    const result = await this.batchesService.uploadCoa(
      batchId,
      file,
      actor.id,
      purityPercent,
      payload?.testingLab,
      false,
    );

    await this.logAudit('BATCH_COA_UPLOAD', actor, {
      batchId,
      coaFileId: result.coaFile?.id,
      storageKey: result.coaFile?.storageKey,
    });

    return result;
  }

  async activateBatch(batchId: string, actor: User) {
    const batch = await this.prisma.productBatch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      throw new NotFoundException(`Batch ${batchId} not found`);
    }

    if (!batch.coaFileId) {
      throw new BadRequestException('COA is required before activation');
    }

    if (batch.isActive) {
      return {
        batch,
        message: 'Batch already active',
      };
    }

    if (!batch.variantId) {
      throw new BadRequestException('Batch must be linked to a variant');
    }

    if (!batch.isAvailable) {
      throw new BadRequestException('Batch is marked unavailable');
    }

    if (batch.expiresAt && batch.expiresAt < new Date()) {
      throw new BadRequestException('Batch is expired');
    }

    await this.prisma.productBatch.updateMany({
      where: {
        variantId: batch.variantId,
        isActive: true,
        id: { not: batchId },
      },
      data: { isActive: false },
    });

    const updated = await this.prisma.productBatch.update({
      where: { id: batchId },
      data: { isActive: true },
    });

    await this.logAudit('BATCH_ACTIVATE', actor, {
      batchId,
      variantId: batch.variantId,
    });

    return updated;
  }

  private mapAdminProductSummary(product: any) {
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

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      category: product.category,
      visibility: product.visibility,
      isActive: product.isActive,
      stockStatus: product.stockStatus,
      currentStock: product.currentStock,
      expectedRestockDate: product.expectedRestockDate,
      variants,
    };
  }

  private mapAdminProductDetail(product: any) {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      category: product.category,
      form: product.form,
      concentration: product.concentration,
      casNumber: product.casNumber,
      molecularFormula: product.molecularFormula,
      visibility: product.visibility,
      isActive: product.isActive,
      stockStatus: product.stockStatus,
      currentStock: product.currentStock,
      expectedRestockDate: product.expectedRestockDate,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      variants: (product.variants || []).map((variant: any) => ({
        id: variant.id,
        strengthValue: this.toNumber(variant.strengthValue),
        strengthUnit: variant.strengthUnit,
        sku: variant.sku,
        priceCents: variant.priceCents,
        isActive: variant.isActive,
        batches: (variant.batches || []).map((batch: any) => ({
          id: batch.id,
          batchCode: batch.batchCode,
          purityPercent: this.toNumber(batch.purityPercent),
          manufacturedAt: batch.manufacturedAt,
          expiresAt: batch.expiresAt,
          testingLab: batch.testingLab,
          isActive: batch.isActive,
          isAvailable: batch.isAvailable,
          hasCoa: !!batch.coaFileId,
        })),
      })),
    };
  }

  private parseOptionalBoolean(value: unknown): boolean | undefined {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      if (value === 'true') return true;
      if (value === 'false') return false;
    }
    return undefined;
  }

  private parseNumber(value: unknown, fieldName: string): number {
    const parsed =
      typeof value === 'string'
        ? Number(value)
        : typeof value === 'number'
        ? value
        : NaN;

    if (!Number.isFinite(parsed)) {
      throw new BadRequestException(`Invalid ${fieldName}`);
    }

    return parsed;
  }

  private parseDate(value: unknown, fieldName: string): Date {
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`Invalid ${fieldName}`);
    }
    return date;
  }

  private parsePriceCents(value: unknown): number | null | undefined {
    if (value === undefined) return undefined;
    if (value === null) return null;

    const parsed = this.parseNumber(value, 'priceCents');

    if (parsed < 0) {
      throw new BadRequestException('priceCents must be >= 0');
    }

    return Math.round(parsed);
  }

  private normalizeStrengthUnit(value: unknown): StrengthUnit {
    if (typeof value !== 'string') {
      throw new BadRequestException('strengthUnit is required');
    }

    const normalized = value.toUpperCase();
    if (!Object.values(StrengthUnit).includes(normalized as StrengthUnit)) {
      throw new BadRequestException('Invalid strengthUnit');
    }

    return normalized as StrengthUnit;
  }

  private normalizeSlug(value: string): string {
    const normalized = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!normalized) {
      return `product-${Date.now()}`;
    }

    return normalized;
  }

  private async ensureUniqueSlug(
    baseSlug: string,
    productId?: string,
  ): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.product.findUnique({
        where: { slug },
        select: { id: true },
      });

      if (!existing || existing.id === productId) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }
  }

  private toNumber(value: any): number {
    if (typeof value === 'number') return value;
    return Number(value);
  }

  private clampNumber(value: number, min: number, max: number): number {
    if (Number.isNaN(value)) return min;
    return Math.min(Math.max(value, min), max);
  }

  private async logAudit(
    action: string,
    actor: User,
    metadata: Record<string, unknown>,
  ) {
    if (!actor?.id) return;

    const entityId =
      (metadata.productId as string | undefined) ||
      (metadata.variantId as string | undefined) ||
      (metadata.batchId as string | undefined);
    const entityType = metadata.productId
      ? 'Product'
      : metadata.variantId
      ? 'ProductVariant'
      : metadata.batchId
      ? 'ProductBatch'
      : undefined;

    await this.auditService.log({
      adminId: actor.id,
      action,
      entityType,
      entityId,
      metadata,
    });
  }

  private parseStockStatus(value: unknown): StockStatus | undefined {
    if (!value || typeof value !== 'string') return undefined;
    const normalized = value.toUpperCase();
    if (!Object.values(StockStatus).includes(normalized as StockStatus)) {
      throw new BadRequestException('Invalid stockStatus');
    }
    return normalized as StockStatus;
  }

  private parseVisibility(value: unknown): ProductVisibility | undefined {
    if (!value || typeof value !== 'string') return undefined;
    const normalized = value.toUpperCase();
    if (
      !Object.values(ProductVisibility).includes(
        normalized as ProductVisibility,
      )
    ) {
      throw new BadRequestException('Invalid visibility');
    }
    return normalized as ProductVisibility;
  }
}

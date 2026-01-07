import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

interface SearchFilters {
  category?: string;
  minPurity?: number;
  maxPurity?: number;
  minPrice?: number;
  maxPrice?: number;
  hasCoa?: boolean;
  isActive?: boolean;
}

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Advanced multi-field search
   * Searches across: name, SKU, CAS number, molecular formula, description
   */
  async searchProducts(query: string, filters: SearchFilters = {}, limit: number = 20) {
    const searchTerm = query.trim();

    // Build where clause for search
    const searchConditions: Prisma.ProductWhereInput[] = [];

    if (searchTerm) {
      // Search in multiple fields
      searchConditions.push(
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { sku: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { casNumber: { contains: searchTerm, mode: 'insensitive' } },
        { molecularFormula: { contains: searchTerm, mode: 'insensitive' } },
      );
    }

    // Build filter conditions
    const filterConditions: Prisma.ProductWhereInput = {};

    if (filters.category) {
      filterConditions.category = filters.category as any;
    }

    if (filters.isActive !== undefined) {
      filterConditions.isActive = filters.isActive;
    }

    // Combine search and filters
    const where: Prisma.ProductWhereInput = {
      ...(searchConditions.length > 0 ? { OR: searchConditions } : {}),
      ...filterConditions,
    };

    // Fetch products with batches
    const products = await this.prisma.product.findMany({
      where,
      include: {
        batches: {
          where: { isActive: true },
          orderBy: { purityPercent: 'desc' },
          take: 1,
        },
      },
      take: limit,
      orderBy: [
        { isActive: 'desc' }, // Active products first
        { name: 'asc' }, // Then alphabetically
      ],
    });

    // Apply purity and price filters (post-fetch filtering)
    let filteredProducts = products;

    if (filters.minPurity !== undefined || filters.maxPurity !== undefined) {
      filteredProducts = filteredProducts.filter((product) => {
        const batch = product.batches[0];
        if (!batch) return false;

        const purity = parseFloat(batch.purityPercent.toString());
        if (filters.minPurity !== undefined && purity < filters.minPurity) return false;
        if (filters.maxPurity !== undefined && purity > filters.maxPurity) return false;

        return true;
      });
    }

    if (filters.hasCoa !== undefined) {
      filteredProducts = filteredProducts.filter((product) => {
        const batch = product.batches[0];
        const hasCoa = batch?.coaFileId ? true : false;
        return hasCoa === filters.hasCoa;
      });
    }

    // Map to response format
    return filteredProducts.map((product) => {
      const batch = product.batches[0];
      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        description: product.description,
        category: product.category,
        casNumber: product.casNumber,
        molecularFormula: product.molecularFormula,
        form: product.form,
        concentration: product.concentration,
        price: 45.99, // TODO: Get from PriceListItem
        purityPercent: batch?.purityPercent
          ? parseFloat(batch.purityPercent.toString())
          : null,
        hasCoa: batch?.coaFileId ? true : false,
        isActive: product.isActive,
        batchCount: product.batches.length,
      };
    });
  }

  /**
   * Get search suggestions/autocomplete
   */
  async getSuggestions(query: string, limit: number = 10) {
    const searchTerm = query.trim();

    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    const products = await this.prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { sku: { contains: searchTerm, mode: 'insensitive' } },
        ],
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        sku: true,
        category: true,
      },
      take: limit,
      orderBy: {
        name: 'asc',
      },
    });

    return products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      type: 'product' as const,
    }));
  }

  /**
   * Get filter options (categories, purity ranges, etc.)
   */
  async getFilterOptions() {
    // Get all unique categories
    const categories = await this.prisma.product.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ['category'],
    });

    // Get purity range from active batches
    const purityStats = await this.prisma.productBatch.aggregate({
      where: { isActive: true },
      _min: { purityPercent: true },
      _max: { purityPercent: true },
    });

    return {
      categories: categories
        .map((c) => c.category)
        .filter(Boolean)
        .sort(),
      purityRange: {
        min: purityStats._min.purityPercent
          ? parseFloat(purityStats._min.purityPercent.toString())
          : 0,
        max: purityStats._max.purityPercent
          ? parseFloat(purityStats._max.purityPercent.toString())
          : 100,
      },
      priceRange: {
        min: 0,
        max: 500, // TODO: Calculate from actual prices
      },
    };
  }

  /**
   * Search by specific field
   */
  async searchByField(field: string, value: string) {
    const where: Prisma.ProductWhereInput = {};

    switch (field) {
      case 'sku':
        where.sku = { contains: value, mode: 'insensitive' };
        break;
      case 'cas':
        where.casNumber = { contains: value, mode: 'insensitive' };
        break;
      case 'formula':
        where.molecularFormula = { contains: value, mode: 'insensitive' };
        break;
      case 'name':
        where.name = { contains: value, mode: 'insensitive' };
        break;
      default:
        throw new Error(`Invalid field: ${field}`);
    }

    const products = await this.prisma.product.findMany({
      where,
      include: {
        batches: {
          where: { isActive: true },
          orderBy: { purityPercent: 'desc' },
          take: 1,
        },
      },
      take: 50,
      orderBy: { name: 'asc' },
    });

    return products.map((product) => {
      const batch = product.batches[0];
      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        casNumber: product.casNumber,
        molecularFormula: product.molecularFormula,
        category: product.category,
        price: 45.99,
        purityPercent: batch?.purityPercent
          ? parseFloat(batch.purityPercent.toString())
          : null,
        hasCoa: batch?.coaFileId ? true : false,
        isActive: product.isActive,
      };
    });
  }
}

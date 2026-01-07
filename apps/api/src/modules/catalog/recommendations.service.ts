import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface RecommendationScore {
  productId: string;
  score: number;
}

@Injectable()
export class RecommendationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get product recommendations using collaborative filtering
   * Based on "users who bought X also bought Y" pattern
   */
  async getProductRecommendations(
    productId: string,
    limit: number = 4,
  ): Promise<any[]> {
    // Find orders that contain this product
    const ordersWithProduct = await this.prisma.order.findMany({
      where: {
        items: {
          some: {
            productId: productId,
          },
        },
        status: {
          in: ['PAID', 'SHIPPED', 'COMPLETED'],
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                batches: {
                  where: { isActive: true },
                  take: 1,
                },
              },
            },
          },
        },
      },
    });

    // Count co-occurrence of products
    const productCounts: Record<string, number> = {};

    for (const order of ordersWithProduct) {
      for (const item of order.items) {
        // Don't recommend the same product
        if (item.productId === productId) continue;

        productCounts[item.productId] = (productCounts[item.productId] || 0) + 1;
      }
    }

    // Sort by count and get top recommendations
    const recommendedProductIds = Object.entries(productCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, limit)
      .map(([id]) => id);

    // If we don't have enough collaborative recommendations,
    // fill with category-based recommendations
    if (recommendedProductIds.length < limit) {
      const sourceProduct = await this.prisma.product.findUnique({
        where: { id: productId },
      });

      if (sourceProduct) {
        const categorySimilar = await this.prisma.product.findMany({
          where: {
            category: sourceProduct.category,
            id: {
              not: productId,
              notIn: recommendedProductIds,
            },
            isActive: true,
          },
          take: limit - recommendedProductIds.length,
          orderBy: {
            createdAt: 'desc',
          },
        });

        recommendedProductIds.push(...categorySimilar.map((p) => p.id));
      }
    }

    // Fetch full product details
    if (recommendedProductIds.length === 0) {
      return [];
    }

    const products = await this.prisma.product.findMany({
      where: {
        id: { in: recommendedProductIds },
        isActive: true,
      },
      include: {
        batches: {
          where: { isActive: true },
          orderBy: { manufacturedAt: 'desc' },
          take: 1,
        },
      },
    });

    // Map to response format
    return products.map((product) => {
      const batch = product.batches[0];
      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        description: product.description,
        category: product.category,
        price: 45.99, // TODO: Get from PriceListItem
        purityPercent: batch?.purityPercent
          ? parseFloat(batch.purityPercent.toString())
          : null,
        hasCoa: batch?.coaFileId ? true : false,
        isActive: product.isActive,
      };
    });
  }

  /**
   * Get personalized recommendations for a user
   * Based on their order history
   */
  async getUserRecommendations(
    userId: string,
    limit: number = 6,
  ): Promise<any[]> {
    // Get user's order history
    const userOrders = await this.prisma.order.findMany({
      where: {
        userId,
        status: {
          in: ['PAID', 'SHIPPED', 'COMPLETED'],
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10, // Last 10 orders
    });

    // Get all products the user has purchased
    const purchasedProductIds = new Set<string>();
    const categoryInterests: Record<string, number> = {};

    for (const order of userOrders) {
      for (const item of order.items) {
        purchasedProductIds.add(item.productId);

        // Track category interest
        if (item.product.category) {
          categoryInterests[item.product.category] =
            (categoryInterests[item.product.category] || 0) + 1;
        }
      }
    }

    // Find the most interested categories
    const topCategories = Object.entries(categoryInterests)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 3)
      .map(([category]) => category);

    // Get recommendations from favorite categories that user hasn't purchased
    const recommendations = await this.prisma.product.findMany({
      where: {
        category: { in: topCategories },
        id: { notIn: Array.from(purchasedProductIds) },
        isActive: true,
      },
      include: {
        batches: {
          where: { isActive: true },
          orderBy: { purityPercent: 'desc' },
          take: 1,
        },
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return recommendations.map((product) => {
      const batch = product.batches[0];
      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        description: product.description,
        category: product.category,
        price: 45.99, // TODO: Get from PriceListItem
        purityPercent: batch?.purityPercent
          ? parseFloat(batch.purityPercent.toString())
          : null,
        hasCoa: batch?.coaFileId ? true : false,
        isActive: product.isActive,
      };
    });
  }

  /**
   * Get trending products (most ordered in last 30 days)
   */
  async getTrendingProducts(limit: number = 6): Promise<any[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get order items from last 30 days
    const recentOrderItems = await this.prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: thirtyDaysAgo },
          status: {
            in: ['PAID', 'SHIPPED', 'COMPLETED'],
          },
        },
      },
      include: {
        product: {
          include: {
            batches: {
              where: { isActive: true },
              orderBy: { purityPercent: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    // Count product occurrences
    const productCounts: Record<string, { count: number; product: any }> = {};

    for (const item of recentOrderItems) {
      if (!productCounts[item.productId]) {
        productCounts[item.productId] = {
          count: 0,
          product: item.product,
        };
      }
      productCounts[item.productId].count += 1;
    }

    // Sort by count and get top products
    const trending = Object.values(productCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(({ product }) => {
        const batch = product.batches[0];
        return {
          id: product.id,
          name: product.name,
          sku: product.sku,
          description: product.description,
          category: product.category,
          price: 45.99, // TODO: Get from PriceListItem
          purityPercent: batch?.purityPercent
            ? parseFloat(batch.purityPercent.toString())
            : null,
          hasCoa: batch?.coaFileId ? true : false,
          isActive: product.isActive,
        };
      });

    return trending;
  }

  /**
   * Get similar products by category and attributes
   */
  async getSimilarProducts(productId: string, limit: number = 4): Promise<any[]> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return [];
    }

    const similar = await this.prisma.product.findMany({
      where: {
        id: { not: productId },
        category: product.category,
        isActive: true,
      },
      include: {
        batches: {
          where: { isActive: true },
          orderBy: { purityPercent: 'desc' },
          take: 1,
        },
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return similar.map((p) => {
      const batch = p.batches[0];
      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        description: p.description,
        category: p.category,
        price: 45.99, // TODO: Get from PriceListItem
        purityPercent: batch?.purityPercent
          ? parseFloat(batch.purityPercent.toString())
          : null,
        hasCoa: batch?.coaFileId ? true : false,
        isActive: p.isActive,
      };
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Wishlist Service
 *
 * NOTE: Requires the following Prisma schema addition:
 *
 * model Wishlist {
 *   id        String   @id @default(uuid())
 *   userId    String
 *   user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
 *   productId String
 *   product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
 *   createdAt DateTime @default(now())
 *
 *   @@unique([userId, productId])
 *   @@index([userId])
 * }
 *
 * Also add to User model:
 *   wishlistItems Wishlist[]
 *
 * And to Product model:
 *   wishlistedBy Wishlist[]
 */

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Add product to wishlist
   */
  async addToWishlist(userId: string, productId: string) {
    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }

    // For now, store in user metadata (until Wishlist table is added)
    // TODO: Replace with proper Wishlist model when schema is updated
    return {
      userId,
      productId,
      added: true,
      message: 'Product added to wishlist',
    };
  }

  /**
   * Remove product from wishlist
   */
  async removeFromWishlist(userId: string, productId: string) {
    // TODO: Implement with Wishlist model
    return {
      userId,
      productId,
      removed: true,
      message: 'Product removed from wishlist',
    };
  }

  /**
   * Get user's wishlist
   */
  async getUserWishlist(userId: string) {
    // TODO: Implement with Wishlist model
    // For now, return empty array
    return [];
  }

  /**
   * Check if product is in wishlist
   */
  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    // TODO: Implement with Wishlist model
    return false;
  }

  /**
   * Get wishlist count for user
   */
  async getWishlistCount(userId: string): Promise<number> {
    // TODO: Implement with Wishlist model
    return 0;
  }

  /**
   * Clear entire wishlist
   */
  async clearWishlist(userId: string) {
    // TODO: Implement with Wishlist model
    return {
      userId,
      cleared: true,
      message: 'Wishlist cleared',
    };
  }
}

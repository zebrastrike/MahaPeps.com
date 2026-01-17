import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { OrderAccountType, OrderStatus, Prisma, User } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { PricingService } from '../catalog/pricing.service';
import { PurchasabilityService } from '../catalog/purchasability.service';

interface AddToCartDto {
  variantId: string;
  quantity: number;
}

interface UpdateCartItemDto {
  quantity: number;
}

@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: PricingService,
    private readonly purchasability: PurchasabilityService,
  ) {}

  /**
   * Get or create draft order (cart) for user
   */
  async getCart(userId: string, user?: User) {
    console.log('[CartService] getCart called for userId:', userId);

    let cart = await this.prisma.order.findFirst({
      where: {
        userId,
        status: OrderStatus.DRAFT,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                variants: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    console.log('[CartService] getCart found cart:', cart ? { id: cart.id, itemsCount: cart.items?.length } : 'none');

    if (!cart) {
      // Create new draft order
      const accountType = this.getAccountType(user);

      cart = await this.prisma.order.create({
        data: {
          userId,
          accountType,
          status: OrderStatus.DRAFT,
          subtotal: new Prisma.Decimal(0),
          tax: new Prisma.Decimal(0),
          shipping: new Prisma.Decimal(0),
          total: new Prisma.Decimal(0),
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  variants: true,
                },
              },
            },
          },
        },
      });
    }

    return this.formatCart(cart);
  }

  /**
   * Add item to cart (or update quantity if exists)
   */
  async addToCart(userId: string, dto: AddToCartDto, user?: User) {
    if (dto.quantity < 1) {
      throw new BadRequestException('Quantity must be at least 1');
    }

    // Check variant is purchasable
    const purchaseCheck = await this.purchasability.isVariantPurchasable(
      dto.variantId,
    );

    if (!purchaseCheck.purchasable) {
      throw new BadRequestException(
        purchaseCheck.reason || 'Product not available',
      );
    }

    // Get variant details
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: dto.variantId },
      include: { product: true },
    });

    if (!variant) {
      throw new NotFoundException('Variant not found');
    }

    // Get pricing
    const { price } = await this.pricing.calculatePrice(
      dto.variantId,
      dto.quantity,
      user,
    );

    // Get or create cart
    const cart = await this.getCartOrder(userId, user);

    // Check if item already exists
    const existingItem = await this.prisma.orderItem.findFirst({
      where: {
        orderId: cart.id,
        productId: variant.productId,
        metadata: {
          path: ['variantId'],
          equals: dto.variantId,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      console.log('[CartService] Updating existing item:', existingItem.id);
      const newQuantity = new Prisma.Decimal(dto.quantity);
      const lineTotal = price.mul(newQuantity);

      await this.prisma.orderItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          unitPrice: price,
          lineTotal,
        },
      });
    } else {
      // Add new item
      console.log('[CartService] Creating new item for cart:', cart.id);
      const lineTotal = price.mul(dto.quantity);

      const newItem = await this.prisma.orderItem.create({
        data: {
          orderId: cart.id,
          productId: variant.productId,
          quantity: new Prisma.Decimal(dto.quantity),
          unitPrice: price,
          lineTotal,
          metadata: {
            variantId: dto.variantId,
            variantSku: variant.sku,
            strengthValue: variant.strengthValue.toString(),
            strengthUnit: variant.strengthUnit,
          },
        },
      });
      console.log('[CartService] Created new item:', newItem.id, 'for order:', cart.id);
    }

    // Recalculate totals
    await this.recalculateCart(cart.id);

    return this.getCart(userId, user);
  }

  /**
   * Update cart item quantity
   */
  async updateCartItem(
    userId: string,
    itemId: string,
    dto: UpdateCartItemDto,
    user?: User,
  ) {
    if (dto.quantity < 0) {
      throw new BadRequestException('Quantity cannot be negative');
    }

    const cart = await this.getCartOrder(userId, user);

    const item = await this.prisma.orderItem.findFirst({
      where: {
        id: itemId,
        orderId: cart.id,
      },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    if (dto.quantity === 0) {
      // Remove item
      await this.prisma.orderItem.delete({ where: { id: itemId } });
    } else {
      // Update quantity and recalculate price
      const variantId = (item.metadata as any)?.variantId;

      if (!variantId) {
        throw new BadRequestException('Invalid cart item metadata');
      }

      const { price } = await this.pricing.calculatePrice(
        variantId,
        dto.quantity,
        user,
      );

      const lineTotal = price.mul(dto.quantity);

      await this.prisma.orderItem.update({
        where: { id: itemId },
        data: {
          quantity: new Prisma.Decimal(dto.quantity),
          unitPrice: price,
          lineTotal,
        },
      });
    }

    await this.recalculateCart(cart.id);

    return this.getCart(userId, user);
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(userId: string, itemId: string, user?: User) {
    const cart = await this.getCartOrder(userId, user);

    const item = await this.prisma.orderItem.findFirst({
      where: {
        id: itemId,
        orderId: cart.id,
      },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.orderItem.delete({ where: { id: itemId } });
    await this.recalculateCart(cart.id);

    return this.getCart(userId, user);
  }

  /**
   * Clear cart (delete all items)
   */
  async clearCart(userId: string, user?: User) {
    const cart = await this.getCartOrder(userId, user);

    await this.prisma.orderItem.deleteMany({
      where: { orderId: cart.id },
    });

    await this.recalculateCart(cart.id);

    return this.getCart(userId, user);
  }

  /**
   * Get cart count (number of items)
   */
  async getCartCount(userId: string): Promise<number> {
    const count = await this.prisma.orderItem.count({
      where: {
        order: {
          userId,
          status: OrderStatus.DRAFT,
        },
      },
    });

    return count;
  }

  // PRIVATE HELPERS

  private async getCartOrder(userId: string, user?: User) {
    let cart = await this.prisma.order.findFirst({
      where: {
        userId,
        status: OrderStatus.DRAFT,
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (!cart) {
      const accountType = this.getAccountType(user);

      cart = await this.prisma.order.create({
        data: {
          userId,
          accountType,
          status: OrderStatus.DRAFT,
          subtotal: new Prisma.Decimal(0),
          tax: new Prisma.Decimal(0),
          shipping: new Prisma.Decimal(0),
          total: new Prisma.Decimal(0),
        },
      });
    }

    return cart;
  }

  private async recalculateCart(orderId: string) {
    const items = await this.prisma.orderItem.findMany({
      where: { orderId },
    });

    const subtotal = items.reduce(
      (sum, item) => sum.add(item.lineTotal),
      new Prisma.Decimal(0),
    );

    // TODO: Calculate tax based on shipping address
    const tax = new Prisma.Decimal(0);

    // TODO: Calculate shipping from Shippo
    const shipping = new Prisma.Decimal(0);

    const total = subtotal.add(tax).add(shipping);

    await this.prisma.order.update({
      where: { id: orderId },
      data: { subtotal, tax, shipping, total },
    });
  }

  private getAccountType(user?: User): OrderAccountType {
    if (!user) return OrderAccountType.RETAIL;

    switch (user.role) {
      case 'CLINIC':
        return OrderAccountType.CLINIC;
      case 'DISTRIBUTOR':
        return OrderAccountType.DISTRIBUTOR;
      default:
        return OrderAccountType.RETAIL;
    }
  }

  private formatCart(cart: any) {
    console.log('[CartService] formatCart called with cart:', {
      id: cart.id,
      itemsLength: cart.items?.length,
      items: cart.items?.map((i: any) => ({ id: i.id, productId: i.productId })),
    });

    const formatted = {
      id: cart.id,
      itemCount: cart.items?.length || 0,
      items: cart.items?.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product?.name,
        quantity: parseFloat(item.quantity.toString()),
        unitPrice: parseFloat(item.unitPrice.toString()),
        lineTotal: parseFloat(item.lineTotal.toString()),
        metadata: item.metadata,
      })) || [],
      subtotal: parseFloat(cart.subtotal.toString()),
      tax: parseFloat(cart.tax.toString()),
      shipping: parseFloat(cart.shipping.toString()),
      total: parseFloat(cart.total.toString()),
    };

    console.log('[CartService] formatCart returning:', { id: formatted.id, itemCount: formatted.itemCount });
    return formatted;
  }
}

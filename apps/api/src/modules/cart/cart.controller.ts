import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CartService } from './cart.service';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * Get current cart
   * GET /cart
   */
  @Get()
  async getCart(@Req() request: Request) {
    const user = (request as any).user;
    return this.cartService.getCart(user.id, user);
  }

  /**
   * Get cart count
   * GET /cart/count
   */
  @Get('count')
  async getCartCount(@Req() request: Request) {
    const user = (request as any).user;
    const count = await this.cartService.getCartCount(user.id);
    return { count };
  }

  /**
   * Add item to cart
   * POST /cart/items
   */
  @Post('items')
  async addToCart(
    @Body() body: { variantId: string; quantity: number },
    @Req() request: Request,
  ) {
    const user = (request as any).user;
    return this.cartService.addToCart(user.id, body, user);
  }

  /**
   * Update cart item quantity
   * PATCH /cart/items/:itemId
   */
  @Patch('items/:itemId')
  async updateCartItem(
    @Param('itemId') itemId: string,
    @Body() body: { quantity: number },
    @Req() request: Request,
  ) {
    const user = (request as any).user;
    return this.cartService.updateCartItem(user.id, itemId, body, user);
  }

  /**
   * Remove item from cart
   * DELETE /cart/items/:itemId
   */
  @Delete('items/:itemId')
  async removeFromCart(
    @Param('itemId') itemId: string,
    @Req() request: Request,
  ) {
    const user = (request as any).user;
    return this.cartService.removeFromCart(user.id, itemId, user);
  }

  /**
   * Clear cart
   * DELETE /cart
   */
  @Delete()
  async clearCart(@Req() request: Request) {
    const user = (request as any).user;
    return this.cartService.clearCart(user.id, user);
  }
}

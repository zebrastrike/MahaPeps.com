import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { OrderService } from './order.service';
import { CreateOrderDto, MarkOrderPaidDto } from './dto/create-order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * Create a new order with compliance validation
   * POST /orders/create
   */
  @Post('create')
  async createOrder(@Body() dto: CreateOrderDto, @Req() req: Request) {
    // TODO: Get userId from authenticated session
    // For now, using a mock user ID
    const userId = 'mock-user-id';

    // Get IP address from request
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.socket.remoteAddress ||
      '0.0.0.0';

    const order = await this.orderService.createOrder(dto, userId, ipAddress);

    return {
      orderId: order.id,
      status: order.status,
      message: 'Order created successfully. Payment instructions sent to email.',
    };
  }

  /**
   * Mark order as paid (admin only)
   * PATCH /orders/:orderId/mark-paid
   */
  @Patch(':orderId/mark-paid')
  // @UseGuards(AdminGuard) // TODO: Add admin auth guard
  async markOrderPaid(
    @Param('orderId') orderId: string,
    @Body() dto: MarkOrderPaidDto,
    @Req() req: Request
  ) {
    // TODO: Get adminId from authenticated session
    const adminId = 'mock-admin-id';

    const order = await this.orderService.markOrderPaid(orderId, dto, adminId);

    return {
      orderId: order.id,
      status: order.status,
      message: 'Order marked as paid successfully.',
    };
  }

  /**
   * Get order by ID
   * GET /orders/:orderId
   */
  @Get(':orderId')
  async getOrder(@Param('orderId') orderId: string) {
    return this.orderService.getOrderById(orderId);
  }

  /**
   * Get all orders for current user
   * GET /orders
   */
  @Get()
  async getUserOrders(@Req() req: Request) {
    // TODO: Get userId from authenticated session
    const userId = 'mock-user-id';

    return this.orderService.getUserOrders(userId);
  }
}

import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { OrdersService } from './orders.service';
import { CreateOrderDto, MarkOrderPaidDto } from './dto/create-order.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('health')
  getHealth(): string {
    return this.ordersService.getHealth();
  }

  @Post()
  async createOrder(@Body() dto: CreateOrderDto, @Req() request: Request) {
    const user = (request as any).user;
    return this.ordersService.createOrder(dto, user.id, request.ip);
  }

  @Get()
  async getUserOrders(@Req() request: Request) {
    const user = (request as any).user;
    return this.ordersService.getUserOrders(user.id);
  }

  @Get(':orderId')
  async getOrder(@Param('orderId') orderId: string) {
    return this.ordersService.getOrderById(orderId);
  }

  @Post(':orderId/mark-paid')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async markOrderPaid(
    @Param('orderId') orderId: string,
    @Body() dto: MarkOrderPaidDto,
    @Req() request: Request,
  ) {
    const user = (request as any).user;
    return this.ordersService.markOrderPaid(orderId, dto, user.id);
  }
}

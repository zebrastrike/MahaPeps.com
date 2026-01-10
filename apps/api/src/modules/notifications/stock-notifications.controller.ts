import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { JwtOptional } from '../../auth/decorators/jwt-optional.decorator';
import { StockNotificationsService } from './stock-notifications.service';

interface StockNotificationRequest {
  productId: string;
  email: string;
}

@Controller('stock-notifications')
export class StockNotificationsController {
  constructor(private readonly stockNotifications: StockNotificationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @JwtOptional()
  async requestNotification(
    @Body() body: StockNotificationRequest,
    @Req() request: any,
  ) {
    return this.stockNotifications.requestNotification({
      productId: body.productId,
      email: body.email,
      userId: request?.user?.id,
    });
  }
}

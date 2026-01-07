import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { ShippoService } from './shippo.service';
import { PrismaService } from '../../prisma.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [OrderController],
  providers: [OrderService, ShippoService, PrismaService],
  exports: [OrderService, ShippoService],
})
export class OrderModule {}

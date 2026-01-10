import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ShippoService } from './shippo.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../../audit/audit.module';

@Module({
  imports: [PrismaModule, NotificationsModule, AuditModule],
  controllers: [OrdersController],
  providers: [OrdersService, ShippoService],
  exports: [OrdersService, ShippoService],
})
export class OrdersModule {}

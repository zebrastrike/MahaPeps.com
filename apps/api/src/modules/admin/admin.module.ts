import { Module } from '@nestjs/common';
import { BatchesModule } from '../batches/batches.module';
import { ComplianceModule } from '../../compliance/compliance.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditModule } from '../../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrdersModule } from '../orders/orders.module';
import { AdminController } from './admin.controller';
import { AdminProductsController } from './admin-products.controller';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminService } from './admin.service';
import { AdminProductsService } from './admin-products.service';

@Module({
  imports: [
    ComplianceModule,
    PrismaModule,
    BatchesModule,
    AuditModule,
    NotificationsModule,
    OrdersModule,
  ],
  controllers: [AdminController, AdminProductsController, AdminOrdersController],
  providers: [AdminService, AdminProductsService],
  exports: [AdminService, AdminProductsService],
})
export class AdminModule {}

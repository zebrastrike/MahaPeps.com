import { Module } from '@nestjs/common';
import { BatchesModule } from '../batches/batches.module';
import { ComplianceModule } from '../../compliance/compliance.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditModule } from '../../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AdminController } from './admin.controller';
import { AdminProductsController } from './admin-products.controller';
import { AdminService } from './admin.service';
import { AdminProductsService } from './admin-products.service';

@Module({
  imports: [ComplianceModule, PrismaModule, BatchesModule, AuditModule, NotificationsModule],
  controllers: [AdminController, AdminProductsController],
  providers: [AdminService, AdminProductsService],
  exports: [AdminService, AdminProductsService],
})
export class AdminModule {}

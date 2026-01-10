import { Module } from '@nestjs/common';
import { BatchesModule } from '../batches/batches.module';
import { ComplianceModule } from '../../compliance/compliance.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { AdminController } from './admin.controller';
import { AdminProductsController } from './admin-products.controller';
import { AdminService } from './admin.service';
import { AdminProductsService } from './admin-products.service';
import { AdminGuard } from './admin.guard';

@Module({
  imports: [ComplianceModule, PrismaModule, BatchesModule],
  controllers: [AdminController, AdminProductsController],
  providers: [AdminService, AdminProductsService, AdminGuard],
  exports: [AdminService, AdminProductsService],
})
export class AdminModule {}

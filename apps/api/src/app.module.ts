import { Module } from '@nestjs/common';
import { ComplianceModule } from './compliance/compliance.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { BatchesModule } from './modules/batches/batches.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { FilesModule } from './modules/files/files.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OrdersModule } from './modules/orders/orders.module';
import { OrgsModule } from './modules/orgs/orgs.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    OrgsModule,
    CatalogModule,
    BatchesModule,
    FilesModule,
    OrdersModule,
    PaymentsModule,
    NotificationsModule,
    ComplianceModule,
    AdminModule,
  ],
})
export class AppModule {}

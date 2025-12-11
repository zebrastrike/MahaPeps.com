import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrgsModule } from './modules/orgs/orgs.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { BatchesModule } from './modules/batches/batches.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    OrgsModule,
    CatalogModule,
    BatchesModule,
    OrdersModule,
    PaymentsModule,
    NotificationsModule,
    AdminModule,
  ],
})
export class AppModule {}

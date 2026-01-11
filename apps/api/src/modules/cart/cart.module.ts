import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { CatalogModule } from '../catalog/catalog.module';
import { OrdersModule } from '../orders/orders.module';
import { AuditModule } from '../../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [CatalogModule, OrdersModule, AuditModule, NotificationsModule],
  controllers: [CartController, CheckoutController],
  providers: [CartService, CheckoutService],
  exports: [CartService, CheckoutService],
})
export class CartModule {}

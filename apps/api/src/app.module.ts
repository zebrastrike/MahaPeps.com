import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import * as Joi from 'joi';
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
import { KycModule } from './modules/kyc/kyc.module';
import { CartModule } from './modules/cart/cart.module';
import { ContactModule } from './modules/contact/contact.module';
import { FaqModule } from './modules/faq/faq.module';
import { BlogModule } from './modules/blog/blog.module';
import { StacksModule } from './modules/stacks/stacks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().min(32).required(),
        ENCRYPTION_KEY: Joi.string().length(64).required(),
        R2_ENDPOINT: Joi.string().uri().optional().allow(''),
        R2_ACCESS_KEY_ID: Joi.string().optional().allow(''),
        R2_SECRET_ACCESS_KEY: Joi.string().optional().allow(''),
        R2_KYC_BUCKET: Joi.string().optional().allow(''),
        R2_COA_BUCKET: Joi.string().optional().allow(''),
        DATABASE_URL: Joi.string().required(),
        REDIS_URL: Joi.string().required(),
      }),
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
    AuthModule,
    UsersModule,
    OrgsModule,
    CatalogModule,
    CartModule,
    BatchesModule,
    FilesModule,
    OrdersModule,
    PaymentsModule,
    NotificationsModule,
    ComplianceModule,
    AdminModule,
    KycModule,
    ContactModule,
    FaqModule,
    BlogModule,
    StacksModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

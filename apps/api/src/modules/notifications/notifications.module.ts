import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationsController } from './notifications.controller';
import { StockNotificationsController } from './stock-notifications.controller';
import { NotificationsService } from './notifications.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { buildRedisConfig } from './redis.config';
import { StockNotificationsService } from './stock-notifications.service';
import { StockNotificationsProcessor } from './stock-notifications.processor';

@Module({
  imports: [
    PrismaModule,
    BullModule.forRoot({
      redis: buildRedisConfig(),
    }),
    BullModule.registerQueue({
      name: 'stock-notifications',
    }),
  ],
  controllers: [NotificationsController, StockNotificationsController],
  providers: [
    NotificationsService,
    StockNotificationsService,
    StockNotificationsProcessor,
  ],
  exports: [NotificationsService, StockNotificationsService],
})
export class NotificationsModule {}

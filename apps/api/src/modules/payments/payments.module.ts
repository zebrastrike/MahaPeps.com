import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentVerificationController } from './payment-verification.controller';
import { PaymentVerificationService } from './payment-verification.service';
import { FilesModule } from '../files/files.module';
import { AuditModule } from '../../audit/audit.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, FilesModule, AuditModule, NotificationsModule],
  controllers: [PaymentsController, PaymentVerificationController],
  providers: [PaymentsService, PaymentVerificationService],
  exports: [PaymentsService, PaymentVerificationService],
})
export class PaymentsModule {}

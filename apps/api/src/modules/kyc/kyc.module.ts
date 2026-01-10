import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuditModule } from '../../audit/audit.module';
import { FilesModule } from '../files/files.module';
import { KycController } from './kyc.controller';
import { KycAdminController } from './kyc-admin.controller';
import { KycService } from './kyc.service';

@Module({
  imports: [PrismaModule, FilesModule, AuditModule],
  controllers: [KycController, KycAdminController],
  providers: [KycService],
  exports: [KycService],
})
export class KycModule {}
